import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import "../../styles/TransactionsPage.css"; // Import the CSS file

export default function TransactionsPage() {
  const { currentUser } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [accountNumber, setAccountNumber] = useState(""); // Add state for the logged-in user's account number

  useEffect(() => {
    async function fetchTransactions() {
      try {
        const token = localStorage.getItem("authToken");

        if (!token) {
          setError("No authentication token found.");
          setLoading(false);
          return;
        }

        setAccountNumber(currentUser.accountNumber);

        const transactionsResponse = await axios.get(
          "http://localhost:8080/api/account/transactions",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setTransactions(transactionsResponse.data);
      } catch (err) {
        setError("Failed to fetch transactions.");
      } finally {
        setLoading(false);
      }
    }

    fetchTransactions();
  }, []);

  if (loading) return <p>Loading transactions...</p>;

  return (
    <div className="transactions-container">
      {error && <p className="error">{error}</p>}
      {transactions.length === 0 ? (
        <p>No previous transactions</p>
      ) : (
        <ul className="transactions-list">
          {transactions.map((transaction) => {
            const isSource = transaction.sourceAccountNumber === accountNumber;
            const isTarget = transaction.targetAccountNumber === accountNumber;

            return (
              <li key={transaction.transactionId} className="transaction-item">
                {isSource ? (
                  <div>
                    <strong>To Account Number:</strong>{" "}
                    {transaction.targetAccountNumber}
                  </div>
                ) : isTarget ? (
                  <div>
                    <strong>From Account Number:</strong>{" "}
                    {transaction.sourceAccountNumber}
                  </div>
                ) : (
                  <>
                    <div>
                      <strong>From Account Number:</strong>{" "}
                      {transaction.sourceAccountNumber}
                    </div>
                    <div>
                      <strong>To Account Number:</strong>{" "}
                      {transaction.targetAccountNumber}
                    </div>
                  </>
                )}
                <div>
                  <strong>Amount:</strong> ${transaction.amount}
                </div>
                <div>
                  <strong>Type:</strong>{" "}
                  {isSource
                    ? "Sent"
                    : isTarget
                    ? "Received"
                    : transaction.transactionType}
                </div>
                <div>
                  <strong>Date:</strong>{" "}
                  {new Date(transaction.transactionDate).toLocaleDateString()}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
