"use client";

import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './view.css'; 

const PersonExpenses = () => {
    const [expenses, setExpenses] = useState([]);
    const [people, setPeople] = useState([]);
    const [selectedPerson, setSelectedPerson] = useState(null);
    const [filteredExpenses, setFilteredExpenses] = useState([]);

    useEffect(() => {
        const fetchExpenses = async () => {
            try {
                const response = await fetch('http://localhost:3001/expenses');
                const data = await response.json();
                setExpenses(data);

                // Extract unique people from expenses
                const uniquePeople = Array.from(new Set(data.flatMap(expense => JSON.parse(expense.people).map(person => person.name))));
                setPeople(uniquePeople);
            } catch (error) {
                console.error('Error fetching expenses:', error);
            }
        };

        fetchExpenses();
    }, []);

    useEffect(() => {
        if (selectedPerson) {
            const personExpenses = expenses.filter(expense =>
                JSON.parse(expense.people).some(person => person.name === selectedPerson.value)
            );
            setFilteredExpenses(personExpenses);
        }
    }, [selectedPerson, expenses]);

    const handlePersonChange = (selectedOption) => {
        setSelectedPerson(selectedOption);
    };

    const options = people.map(person => ({ value: person, label: person }));

    const formatCurrency = (value) => `£${value.toLocaleString()}`;

    return (
        <div className="person-expenses-container">
            <button className="back-to-dashboard-btn dark" onClick={() => window.location.href = '/dashboard'}>Back to Dashboard</button>
            <h1>Person Expenses</h1>
            <Select
                options={options}
                value={selectedPerson}
                onChange={handlePersonChange}
                placeholder="Select a person"
                className="person-select"
            />
            {selectedPerson && filteredExpenses.length > 0 && (
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart
                        data={filteredExpenses}
                        margin={{
                            top: 20, right: 30, left: 20, bottom: 20,
                        }}
                    >
                        <defs>
                            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis dataKey="date" tick={{ fill: '#8884d8' }} />
                        <YAxis tickFormatter={formatCurrency} tick={{ fill: '#8884d8' }} />
                        <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ backgroundColor: '#333', borderRadius: '10px', border: 'none', color: '#fff' }} />
                        <Legend verticalAlign="top" height={36} />
                        <Line type="monotone" dataKey="amount" stroke="#8884d8" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }} fillOpacity={1} fill="url(#colorUv)" />
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}

export default PersonExpenses;