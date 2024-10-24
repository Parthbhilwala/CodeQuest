// src/App.js
import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import axios from 'axios';
import './App.css';

function App() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState({ reddit: [], stackOverflow: [] });
    const [filteredResults, setFilteredResults] = useState({ reddit: [], stackOverflow: [] });
    const [sortBy, setSortBy] = useState('relevance');
    const [timeFilter, setTimeFilter] = useState('all');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [emailSending, setEmailSending] = useState(false);
    const [emailError, setEmailError] = useState('');

   
    const handleSearch = async () => {
        if (!query.trim()) {
            setError('Please enter a search query');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Fetch Reddit data
            const redditResponse = await axios.get(
                `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&limit=10`,
                { headers: { 'User-Agent': 'CodeQuestSearch/1.0' } }
            );

            // Fetch Stack Overflow data
            const stackOverflowResponse = await axios.get(
                `https://api.stackexchange.com/2.3/search?order=desc&sort=relevance&intitle=${encodeURIComponent(query)}&site=stackoverflow&filter=withbody`,
                { headers: { 'User-Agent': 'CodeQuestSearch/1.0' } }
            );

            const searchResults = {
                reddit: redditResponse.data.data.children || [],
                stackOverflow: stackOverflowResponse.data.items || []
            };

            setResults(searchResults);
            applyFilters(searchResults, sortBy, timeFilter);
        } catch (error) {
            console.error('Search error:', error);
            setError('Failed to fetch results. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = (data, sortType, timeRange) => {
        let filtered = {
            reddit: [...(data.reddit || [])],
            stackOverflow: [...(data.stackOverflow || [])]
        };

        // Apply time filter
        const now = Math.floor(Date.now() / 1000);
        const timeFilters = {
            day: 24 * 60 * 60,
            week: 7 * 24 * 60 * 60,
            month: 30 * 24 * 60 * 60,
            year: 365 * 24 * 60 * 60
        };

        if (timeRange !== 'all') {
            const timeLimit = now - timeFilters[timeRange];
            filtered.reddit = filtered.reddit.filter(item => 
                item.data.created_utc > timeLimit
            );
            filtered.stackOverflow = filtered.stackOverflow.filter(item => 
                item.creation_date > timeLimit
            );
        }

        // Apply sorting
        if (sortType !== 'relevance') {
            filtered.reddit.sort((a, b) => {
                switch (sortType) {
                    case 'date':
                        return b.data.created_utc - a.data.created_utc;
                    case 'score':
                        return b.data.score - a.data.score;
                    case 'comments':
                        return b.data.num_comments - a.data.num_comments;
                    default:
                        return 0;
                }
            });

            filtered.stackOverflow.sort((a, b) => {
                switch (sortType) {
                    case 'date':
                        return b.creation_date - a.creation_date;
                    case 'score':
                        return b.score - a.score;
                    case 'comments':
                        return b.answer_count - a.answer_count;
                    default:
                        return 0;
                }
            });
        }

        setFilteredResults(filtered);
    };

    useEffect(() => {
        if (results.reddit.length > 0 || results.stackOverflow.length > 0) {
            applyFilters(results, sortBy, timeFilter);
        }
    }, [sortBy, timeFilter, results]);

    const handleEmail = async () => {
        if (!email || !email.includes('@')) {
            setEmailError('Please enter a valid email address');
            return;
        }

        if (!filteredResults.reddit?.length && !filteredResults.stackOverflow?.length) {
            setEmailError('No results to send');
            return;
        }

        setEmailSending(true);
        setEmailError('');

        try {
            const response = await axios.post('http://localhost:5000/api/send-email', {
                email,
                results: filteredResults,
                query,
            });

            if (response.data.success) {
                setEmail('');
                alert('Email sent successfully!');
            }
        } catch (error) {
            console.error('Email error:', error);
            setEmailError(error.response?.data?.error || 'Failed to send email');
        } finally {
            setEmailSending(false);
        }
    };

    const formatDate = (date) => {
        return new Date(date * 1000).toLocaleDateString();
    };

    const truncateText = (text, maxLength = 200) => {
        if (!text) return '';
        return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
    };
    return (
        <div className="app-container">
            <div className="search-container">
                <h1 className="main-title">Code Quest Search</h1>
                
                <div className="search-controls">
                    <div className="search-input-group">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Enter your search query"
                            className="search-input"
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <button 
                            onClick={handleSearch} 
                            disabled={loading}
                            className="search-button"
                        >
                            {loading ? 'Searching...' : 'Search'}
                        </button>
                    </div>

                    <div className="filter-controls">
                        <select 
                            value={sortBy} 
                            onChange={(e) => setSortBy(e.target.value)}
                            className="filter-select"
                        >
                            <option value="relevance">Sort by Relevance</option>
                            <option value="date">Sort by Date</option>
                            <option value="score">Sort by Most Upvoted</option>
                            <option value="comments">Sort by Most Commented</option>
                        </select>

                        <select 
                            value={timeFilter} 
                            onChange={(e) => setTimeFilter(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">All Time</option>
                            <option value="day">Last 24 Hours</option>
                            <option value="week">Past Week</option>
                            <option value="month">Past Month</option>
                            <option value="year">Past Year</option>
                        </select>
                    </div>
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="results-container">
                {filteredResults.reddit?.length > 0 && (
                    <div className="results-section">
                        <h2 className="section-title">Reddit Results ({filteredResults.reddit.length})</h2>
                        <div className="results-list">
                            {filteredResults.reddit.map((item) => (
                                <div key={item.data.id} className="result-card">
                                    <h3 className="result-title">
                                        <a href={`https://reddit.com${item.data.permalink}`} 
                                           target="_blank" 
                                           rel="noreferrer"
                                        >
                                            {item.data.title}
                                        </a>
                                    </h3>
                                    <div className="result-meta">
                                        <span className="meta-item">
                                            <Calendar size={16} />
                                            {formatDate(item.data.created_utc)}
                                        </span>
                                        <span className="meta-item">Score: {item.data.score}</span>
                                        <span className="meta-item">Comments: {item.data.num_comments}</span>
                                    </div>
                                    <p className="result-content">{truncateText(item.data.selftext)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {filteredResults.stackOverflow?.length > 0 && (
                    <div className="results-section">
                        <h2 className="section-title">Stack Overflow Results ({filteredResults.stackOverflow.length})</h2>
                        <div className="results-list">
                            {filteredResults.stackOverflow.map((item) => (
                                <div key={item.question_id} className="result-card">
                                    <h3 className="result-title">
                                        <a href={item.link} 
                                           target="_blank" 
                                           rel="noreferrer"
                                        >
                                            {item.title}
                                        </a>
                                    </h3>
                                    <div className="result-meta">
                                        <span className="meta-item">
                                            <Calendar size={16} />
                                            {formatDate(item.creation_date)}
                                        </span>
                                        <span className="meta-item">Score: {item.score}</span>
                                        <span className="meta-item">Answers: {item.answer_count}</span>
                                    </div>
                                    <p className="result-content">{truncateText(item.body_markdown)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="email-container">
                <div className="email-input-group">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter email to receive results"
                        className="email-input"
                    />
                    <button 
                        onClick={handleEmail} 
                        className="email-button"
                        disabled={emailSending}
                    >
                        {emailSending ? 'Sending...' : 'Send Results'}
                    </button>
                </div>
                {emailError && <div className="email-error">{emailError}</div>}
            </div>
        </div>
    );
}

export default App;
