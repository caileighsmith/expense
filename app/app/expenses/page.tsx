"use client";

import React, { useEffect, useState } from 'react';
import './expenses.css'; 

const AllExpenses = () => {
    const [expenses, setExpenses] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        minAmount: '',
        maxAmount: '',
        startDate: '',
        endDate: '',
        isRecurring: '',
    });

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

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prevFilters) => ({
            ...prevFilters,
            [name]: value,
        }));
    };

    const handleDeleteClick = async (id) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this expense?');
        if (confirmDelete) {
            try {
                const response = await fetch(`http://localhost:3001/expense/${id}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    setExpenses((prevExpenses) => prevExpenses.filter((expense) => expense.id !== id));
                    alert('Expense deleted successfully!');
                } else {
                    alert('Failed to delete expense');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred while deleting the expense');
            }
        }
    };

    const filteredExpenses = expenses.filter((expense) => {
        const matchesSearchTerm = expense.expenseName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesMinAmount = filters.minAmount === '' || expense.amount >= parseFloat(filters.minAmount);
        const matchesMaxAmount = filters.maxAmount === '' || expense.amount <= parseFloat(filters.maxAmount);
        const matchesStartDate = filters.startDate === '' || new Date(expense.date) >= new Date(filters.startDate);
        const matchesEndDate = filters.endDate === '' || new Date(expense.date) <= new Date(filters.endDate);
        const matchesRecurring = filters.isRecurring === '' || expense.isRecurring === (filters.isRecurring === 'true');

        return matchesSearchTerm && matchesMinAmount && matchesMaxAmount && matchesStartDate && matchesEndDate && matchesRecurring;
    });

    return (
        <div className="dashboard-container">
            <button className="back-to-dashboard-btn dark" onClick={() => window.location.href = '/dashboard'}>Back to Dashboard</button>
            <h1>All Expenses</h1>
            <div className="filters">
                <input
                    type="text"
                    placeholder="Search by expense name"
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
                <input
                    type="number"
                    name="minAmount"
                    placeholder="Min Amount"
                    value={filters.minAmount}
                    onChange={handleFilterChange}
                />
                <input
                    type="number"
                    name="maxAmount"
                    placeholder="Max Amount"
                    value={filters.maxAmount}
                    onChange={handleFilterChange}
                />
                <input
                    type="date"
                    name="startDate"
                    placeholder="Start Date"
                    value={filters.startDate}
                    onChange={handleFilterChange}
                />
                <input
                    type="date"
                    name="endDate"
                    placeholder="End Date"
                    value={filters.endDate}
                    onChange={handleFilterChange}
                />
                <select name="isRecurring" value={filters.isRecurring} onChange={handleFilterChange}>
                    <option value="">All</option>
                    <option value="true">Recurring</option>
                    <option value="false">Non-Recurring</option>
                </select>
            </div>
            <div className="expenses-grid">
                {filteredExpenses.length > 0 ? (
                    filteredExpenses.map((expense) => (
                        <div key={expense.id} className="expense-card">
                            <button className="delete-btn" onClick={() => handleDeleteClick(expense.id)}>x</button>
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
                    ))
                ) : (
                    <p>No expenses available</p>
                )}
            </div>
        </div>
    );
}

export default AllExpenses;