<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = $_POST["name"];
    $email = $_POST["email"];
    $message = $_POST["message"];
    
    $to = "your_email@example.com"; // Replace with your email address
    $subject = "Contact Form Submission";
    $body = "Name: $name\nEmail: $email\nMessage:\n$message";
    
    mail($to, $subject, $body);
    
    // Redirect back to the form after sending the email
    header("Location: your_form_page.html"); // Replace with the actual filename of your form page
    exit();
}
?>
