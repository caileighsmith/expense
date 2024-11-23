"use client";

import React, { useEffect, useState } from 'react';
import './Dashboard.css'; 

const Dashboard = () => {
    const [expenses, setExpenses] = useState([]);

    useEffect(() => {
        const fetchExpenses = async () => {
            try {
                const response = await fetch('http://localhost:3001/expenses');
                const data = await response.json();
                setExpenses(data);
            } catch (error) {
                console.error('Error fetching expenses:', error);
            }
        };

        fetchExpenses();
    }, []);

    const lastThreeExpenses = expenses.slice(-3);

    return (
        <div className="dashboard-container">
            <div className="dropdown">
                <button className="dropbtn">
                    Create Expense <span className="arrow">&#9662;</span>
                </button>
                <div className="dropdown-content">
                    <a href="/create-expense/group">Group Expense</a>
                    <a href="/create-expense/solo">Solo Expense</a>
                </div>
            </div>
            <h1>Last 3 Expenses:</h1>

            <div className="expenses-grid">
                {lastThreeExpenses.map((expense) => (
                    <div key={expense.id} className="expense-card">
                        <h3>{expense.expenseName}</h3>
                        <p><strong>Amount:</strong> £{expense.amount.toLocaleString()}</p>
                        <p><strong>Date:</strong> {expense.date}</p>
                        <p><strong>Description:</strong> {expense.description}</p>
                        <p><strong>People:</strong> {JSON.parse(expense.people).map((person, index) => (
                            <span key={index} className="person-tooltip">
                                {person.name}
                                <span className="tooltip-text">{person.percentage}%</span>
                            </span>
                        )).reduce((prev, curr) => [prev, ', ', curr])}</p>
                        <p><strong>Recurring:</strong> {expense.isRecurring ? `Yes, on day ${expense.recurringDay}` : 'No'}</p>
                    </div>
                ))}
            </div>
            <button className="view-all-btn" onClick={() => window.location.href = '/expenses'}>More..</button>
            <div className="navigation-buttons">
                <button onClick={() => window.location.href = '/expense-report'}>Generate Expense Report</button>
                <button onClick={() => window.location.href = '/expenses'}>View All Expenses</button>
                <button onClick={() => window.location.href = '/dashboard/view'}>Generate Graph</button>
            </div>
        </div>
    );
}

export default Dashboard;