import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function IssueView() {
  const { id } = useParams(); // Get the issue ID from the URL
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIssue = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/issues/${id}`,
          { withCredentials: true }
        );
        setIssue(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching issue:", error);
        setLoading(false);
      }
    };

    fetchIssue();
  }, [id]);

  if (loading) return <div>Loading...</div>;

  if (!issue) return <div>Issue not found</div>;

  return (
    <div className="issue-view">
      <h1>{issue.title}</h1>
      <p>
        <strong>Description:</strong> {issue.description}
      </p>
      <p>
        <strong>Status:</strong> {issue.status_id}
      </p>
      <p>
        <strong>Charm:</strong> {issue.charm}
      </p>
      <p>
        <strong>Project ID:</strong> {issue.project_id}
      </p>
      <p>
        <strong>Reported by:</strong> {issue.reporter_id}
      </p>
      <p>
        <strong>Created at:</strong>{" "}
        {new Date(issue.created_at).toLocaleString()}
      </p>
      <p>
        <strong>Updated at:</strong>{" "}
        {new Date(issue.updated_at).toLocaleString()}
      </p>

      <h2>Occurrences</h2>
      <ul>
        {issue.occurrences.map((occurrence) => (
          <li key={occurrence._id}>
            <p>
              <strong>Date:</strong>{" "}
              {new Date(occurrence.created_at).toLocaleString()}
            </p>
            <p>
              <strong>Description:</strong> {occurrence.description}
            </p>
          </li>
        ))}
      </ul>

      <h2>Attachments</h2>
      <ul>
        {issue.attachments.map((attachment) => (
          <li key={attachment._id}>
            <p>
              <strong>File:</strong> {attachment.file_path}
            </p>
            <p>
              <strong>Attached at:</strong>{" "}
              {new Date(attachment.created_at).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>

      <h2>Comments</h2>
      <ul>
        {issue.comments.map((comment) => (
          <li key={comment._id}>
            <p>{comment.comment_text}</p>
            <p>Commented at: {new Date(comment.created_at).toLocaleString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default IssueView;
