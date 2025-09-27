function confirmAddress(orderId) {
    fetch(`/delivery/confirm-address/${orderId}`)
        .then(response => response.text())
        .then(data => alert('Confirmed: ' + data))
        .catch(error => alert('Error: ' + error));
}

function fetchStatus(assignmentId) {
    fetch(`/delivery/status/${assignmentId}`)  // Assume you add a @GetMapping("/status/{id}") in controller
        .then(response => response.json())
        .then(data => {
            document.getElementById('status').innerText = data.status;
            // Update map if needed
        });
}

// Client-side validation example for forms
document.querySelector('form').addEventListener('submit', function(e) {
    let driverSelect = document.querySelector('select[name="driverId"]');
    if (!driverSelect.value) {
        alert('Select a driver');
        e.preventDefault();
    }
});