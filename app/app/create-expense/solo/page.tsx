import React from 'react';
import './page.css'; 

const CreateSoloExpense = () => {
    return (
        <div className="dashboard-container">
            <div className="card">
                <h2>Create Solo Expense</h2>
                <form>
                    <div className="form-group">
                        <label htmlFor="expenseName">Expense Name</label>
                        <input type="text" id="expenseName" name="expenseName" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="amount">Amount</label>
                        <input type="number" id="amount" name="amount" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="date">Date</label>
                        <input type="date" id="date" name="date" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="description">Description</label>
                        <textarea id="description" name="description" required></textarea>
                    </div>
                    <button type="submit" className="submit-btn">Submit</button>
                </form>
            </div>
        </div>
    );
}

export default CreateSoloExpense;