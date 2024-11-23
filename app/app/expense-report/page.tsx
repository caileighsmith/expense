"use client";

import React, { useState, useEffect } from 'react';
import { Card, Title, Button, TextInput } from '@tremor/react';
import './view.css'; 

const ExpenseReport = () => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [minAmount, setMinAmount] = useState('');
    const [maxAmount, setMaxAmount] = useState('');
    const [person, setPerson] = useState('');
    const [peopleOptions, setPeopleOptions] = useState([]);
    const [dateRange, setDateRange] = useState({ minDate: '', maxDate: '' });

    useEffect(() => {
        const fetchFilterOptions = async () => {
            try {
                const response = await fetch('http://localhost:3001/filter-options');
                const data = await response.json();
                setPeopleOptions(data.people.map(person => person.name));
                setDateRange(data.dateRange);
            } catch (error) {
                console.error('Error fetching filter options:', error);
            }
        };

        fetchFilterOptions();
    }, []);

    const handleGenerateReport = async () => {
        console.log('Generating report with filters:', { startDate, endDate, minAmount, maxAmount, person });
        const queryParams = new URLSearchParams({
            ...(startDate && { startDate }),
            ...(endDate && { endDate }),
            ...(minAmount && { minAmount }),
            ...(maxAmount && { maxAmount }),
            ...(person && { person }),
        }).toString();

        try {
            const response = await fetch(`http://localhost:3001/expense-report?${queryParams}`, {
                method: 'GET',
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'expense-report.xlsx';
                document.body.appendChild(a);
                a.click();
                a.remove();
            } else {
                alert('Failed to generate expense report');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while generating the expense report');
        }
    };

    return (
        <div className="expense-report-container">
            <button className="back-to-dashboard-btn dark" onClick={() => window.location.href = '/dashboard'}>Back to Dashboard</button>
            <Title>Generate Expense Report</Title>
            <Card className="report-card">
                <div className="form-group">
                    <label htmlFor="startDate">Start Date</label>
                    <TextInput
                        id="startDate"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        placeholder={dateRange.minDate}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="endDate">End Date</label>
                    <TextInput
                        id="endDate"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        placeholder={dateRange.maxDate}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="minAmount">Min Amount</label>
                    <TextInput
                        id="minAmount"
                        type="number"
                        value={minAmount}
                        onChange={(e) => setMinAmount(e.target.value)}
                        placeholder="0"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="maxAmount">Max Amount</label>
                    <TextInput
                        id="maxAmount"
                        type="number"
                        value={maxAmount}
                        onChange={(e) => setMaxAmount(e.target.value)}
                        placeholder="10000"
                    />
                </div>
                <Button onClick={handleGenerateReport}>Generate Report</Button>
            </Card>
        </div>
    );
}

export default ExpenseReport;