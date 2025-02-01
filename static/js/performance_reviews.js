// For submitting a review
document.getElementById("performanceReviewForm").onsubmit = async function (event) {
    event.preventDefault();

    const review = {
        employee_email: document.getElementById("employeeEmail").value.trim(),
        task_id: document.getElementById("taskId").value.trim(),
        rating: parseInt(document.getElementById("rating").value.trim()),
        comments: document.getElementById("comments").value.trim(),
        review_date: document.getElementById("review_date").value.trim()
    };

    
    console.log("Submitting review with data:", review);

    try {
        const response = await fetch("http://127.0.0.1:8000/performance_reviews/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(review),
        });

        console.log("Response status:", response.status);

        if (response.ok) {
            const result=await response.json();
            console.log("Review submitted successfully:", result);
            alert("Performance review submitted successfully!");
            document.getElementById("performanceReviewForm").reset(); // Clear the form
        } else {
            const errorData = await response.json(); // Parse the error response
            throw new Error(errorData.detail || "Failed to submit performance review.");
        }
    } catch (error) {
        console.error("Error submitting performance review:", error);
        alert("Error: " + error.message);
    }
};

// For fetching reviews
async function fetchPerformanceReviews() {
    const email = document.getElementById("searchEmail").value.trim();
    if (!email) {
        alert("Please enter an email address to search for reviews.");
        return;
    }

    try {
        const response = await fetch(`http://127.0.0.1:8000/performance_reviews/${email}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch reviews: ${response.statusText}`);
        }

        const reviews = await response.json();
        const reviewsList = document.getElementById("reviewsList");
        reviewsList.innerHTML = ""; // Clear previous reviews

        if (reviews.length === 0) {
            reviewsList.innerHTML = "<p>No performance reviews found for this employee.</p>";
        } else {
            reviews.forEach(review => {
                const reviewDate = review.review_date ? new Date(review.review_date).toLocaleDateString() : "N/A";
                reviewsList.innerHTML += `
                    <div>
                        <h4>Task ID: ${review.task_id}</h4>
                        <p>Rating: ${review.rating}</p>
                        <p>Comments: ${review.comments}</p>
                        <p>Review Date: ${review.review_date}</p>
                    </div>
                    <hr>
                `;
            });
        }
    } catch (error) {
        console.error("Error fetching performance reviews:", error);
        alert("Error loading performance reviews. Please try again.");
    }
}