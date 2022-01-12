$(document).ajaxComplete((event, xhr, settings) => {
    // if the response is 301, show an error message
    if (xhr.status === 401) {
        $('#error').text('Invalid username or password');
    }
});