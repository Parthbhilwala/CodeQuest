const nodemailer = require('nodemailer');
const Mailgen = require('mailgen');

// Load environment variables (you'll need to create these)
// const EMAIL = process.env.EMAIL;          // Your Gmail address
// const APP_PASSWORD = process.env.APP_PASSWORD;  // Your Gmail app password
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = process.env.SMTP_PORT || 465;

// Configure Mailgen
const MailGenerator = new Mailgen({
    theme: "default",
    product: {
        name: "CodeQuest Search",
        link: 'https://your-app-url.com/',
        logo: 'https://your-logo-url.com/logo.png' // Optional
    }
});

// Configure SMTP transporter with secure settings
const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: true, // true for port 465, false for other ports
    auth: {
        user: 'parthbhilwala@gmail.com',
        pass: 'epvmsmuscgjrvtpw'
    },
    tls: {
        // Do not fail on invalid certificates
        rejectUnauthorized: false,
        // Minimum TLS version
        minVersion: 'TLSv1.2'
    },
    pool: true, // Use pooled connections
    maxConnections: 5, // Maximum number of simultaneous connections
    maxMessages: 100 // Maximum number of messages to send using a connection
});

// Verify SMTP connection
const verifyConnection = async () => {
    try {
        await transporter.verify();
        console.log('SMTP connection verified successfully');
    } catch (error) {
        console.error('SMTP connection verification failed:', error);
        throw error;
    }
};

// Helper function to truncate content (remains the same)
const truncateContent = (content, maxSize = 40000) => {
    if (!content) return '';
    const stringContent = String(content);
    if (Buffer.byteLength(stringContent, 'utf8') <= maxSize) {
        return stringContent;
    }
    let truncated = stringContent;
    while (Buffer.byteLength(truncated, 'utf8') > maxSize) {
        truncated = truncated.slice(0, truncated.lastIndexOf(' '));
    }
    return truncated + '...';
};

// Helper function to prepare results for email (remains the same)
const prepareResultsForEmail = (results) => {
    const redditResults = results.reddit?.slice(0, 5).map(item => ({
        item: `Reddit: ${item.data.title}`,
        description: truncateContent(item.data.selftext || 'No content', 200),
        score: item.data.score,
        comments: item.data.num_comments,
        link: `https://reddit.com${item.data.permalink}`
    })) || [];

    const stackOverflowResults = results.stackOverflow?.slice(0, 5).map(item => ({
        item: `Stack Overflow: ${item.title}`,
        description: truncateContent(item.body_markdown || 'No content', 200),
        score: item.score,
        answers: item.answer_count,
        link: item.link
    })) || [];

    return [...redditResults, ...stackOverflowResults];
};

const searchController = {
    // Existing search function remains the same...
    search: async (req, res) => {
        const { query } = req.query;
        
        if (!query) {
            return res.status(400).json({ error: 'Search query is required' });
        }

        try {
            // Fetch Reddit results
            const redditResponse = await axios.get(
                `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&limit=10`,
                { headers: { 'User-Agent': 'CodeQuestSearch/1.0' } }
            );

            // Fetch Stack Overflow results
            const stackOverflowResponse = await axios.get(
                `https://api.stackexchange.com/2.3/search?order=desc&sort=relevance&intitle=${encodeURIComponent(query)}&site=stackoverflow&filter=withbody`,
                { headers: { 'User-Agent': 'CodeQuestSearch/1.0' } }
            );

            const results = {
                reddit: redditResponse.data.data.children || [],
                stackOverflow: stackOverflowResponse.data.items || []
            };

            // Store the current search results in session or cache if needed
            // This depends on your session management strategy
            
            res.json(results);
        } catch (error) {
            console.error('Search error:', error);
            res.status(500).json({ error: 'Search failed', details: error.message });
        }
    },
    sendEmail: async (req, res) => {
        const { email, results, query } = req.body;

        if (!email || !results) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        try {
            // Verify SMTP connection before sending
            await verifyConnection();

            // Prepare email content using Mailgen
            const emailBody = {
                body: {
                    name: "CodeQuest User",
                    intro: `Here are your search results for: "${query}"`,
                    table: {
                        data: prepareResultsForEmail(results),
                        columns: {
                            item: "Title",
                            description: "Content Preview",
                            score: "Score",
                            link: "Link"
                        }
                    },
                    outro: [
                        "Thank you for using CodeQuest Search!",
                        "If you have any questions, feel free to reach out to our support team."
                    ],
                    signature: 'Best regards'
                }
            };

            // Generate email HTML
            const emailHTML = MailGenerator.generate(emailBody);

            // Check email content size
            const emailSize = Buffer.byteLength(emailHTML, 'utf8');
            if (emailSize > 50000) { // 50KB limit
                throw new Error('Email content too large. Please reduce the number of results.');
            }

            const message = {
                from: {
                    name: 'CodeQuest Search',
                    address: 'parthbhilwala@gmail.com'
                },
                to: email,
                subject: `Search Results for: ${query}`,
                html: emailHTML,
                headers: {
                    'X-Priority': '3', // Normal priority
                    'X-Mailer': 'CodeQuest Mailer'
                },
                // Add text version for better email client compatibility
                text: MailGenerator.generatePlaintext(emailBody)
            };

            const info = await transporter.sendMail(message);
            
            res.json({ 
                success: true, 
                message: 'Email sent successfully',
                emailSize: `${(emailSize / 1024).toFixed(2)}KB`,
                messageId: info.messageId
            });
        } catch (error) {
            console.error('Email error:', error);
            res.status(500).json({ 
                error: 'Failed to send email', 
                details: error.message 
            });
        }
    }
};

module.exports = searchController;