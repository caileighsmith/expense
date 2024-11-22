"use client";

import React, { useState } from 'react';
import './page.css'; 

const CreateGroupExpense = () => {
    const [people, setPeople] = useState([{ name: '', percentage: '' }]);
    const [isRecurring, setIsRecurring] = useState(false);
    const [recurringDay, setRecurringDay] = useState('');

    const handleAddPerson = () => {
        setPeople([...people, { name: '', percentage: '' }]);
    };

    const handleRemovePerson = (index) => {
        const newPeople = people.filter((_, i) => i !== index);
        setPeople(newPeople);
    };

    const handlePersonChange = (index, field, value) => {
        const newPeople = [...people];
        newPeople[index][field] = value;
        setPeople(newPeople);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const totalPercentage = people.reduce((acc, person) => acc + parseFloat(person.percentage || 0), 0);
        if (totalPercentage !== 100) {
            alert('Total percentage allocation must add up to 100%');
            return;
        }

        const expenseData = {
            expenseName: e.target.expenseName.value,
            amount: e.target.amount.value,
            date: e.target.date.value,
            description: e.target.description.value,
            people,
            isRecurring,
            recurringDay: isRecurring ? e.target.recurringDay.value : null,
        };

        try {
            const response = await fetch('http://localhost:3001/expense', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(expenseData),
            });

            if (response.ok) {
                alert('Expense created successfully!');
                // Optionally, reset the form here
            } else {
                alert('Failed to create expense');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while creating the expense');
        }
    };

    return (
        <div className="dashboard-container">
            <div className="card">
                <h2>Create Group Expense</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group-inline">
                        <div className="form-group">
                            <label htmlFor="expenseName">Expense Name</label>
                            <input type="text" id="expenseName" name="expenseName" required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="amount">Amount (£)</label>
                            <input type="number" id="amount" name="amount" required />
                        </div>
                    </div>
                    <div className="form-group-inline">
                        <div className="form-group">
                            <label htmlFor="date">Date</label>
                            <input type="date" id="date" name="date" required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="description">Description</label>
                            <textarea id="description" name="description" required></textarea>
                        </div>
                    </div>
                    <div className="form-group button-group">
                        <button type="button" className="add-person-btn" onClick={handleAddPerson}>Add Person</button>
                        <button type="button" className="recurring-btn" onClick={() => setIsRecurring(!isRecurring)}>
                            {isRecurring ? 'Recurring: On' : 'Recurring: Off'}
                        </button>
                    </div>
                    {isRecurring && (
                        <div className="form-group">
                            <label htmlFor="recurringDay">Recurring Day</label>
                            <input
                                type="number"
                                id="recurringDay"
                                name="recurringDay"
                                min="1"
                                max="31"
                                value={recurringDay}
                                onChange={(e) => setRecurringDay(e.target.value)}
                                required
                            />
                        </div>
                    )}
                    <div className="people-list">
                        {people.map((person, index) => (
                            <div key={index} className="person-card">
                                <button type="button" className="remove-person-btn" onClick={() => handleRemovePerson(index)}>x</button>
                                <div className="form-group">
                                    <label htmlFor={`personName${index}`}>Name</label>
                                    <input
                                        type="text"
                                        id={`personName${index}`}
                                        name={`personName${index}`}
                                        value={person.name}
                                        onChange={(e) => handlePersonChange(index, 'name', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor={`personPercentage${index}`}>Percentage</label>
                                    <input
                                        type="number"
                                        id={`personPercentage${index}`}
                                        name={`personPercentage${index}`}
                                        value={person.percentage}
                                        onChange={(e) => handlePersonChange(index, 'percentage', e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                    <button type="submit" className="submit-btn">Submit</button>
                </form>
            </div>
        </div>
    );
}

export default CreateGroupExpense;