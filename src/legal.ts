export const CONTACT_ME: string = 'hello@promptspellsmith.com'

export const legalHTML = (): string => `
<!DOCTYPE html>
<html>
<head>
    <title>TimeMachine ChatGPT Plugin - Legal Information</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            margin: 0 auto;
            max-width: 800px;
            padding: 20px;
            line-height: 1.6;
        }
        h1, h2 {
            border-bottom: 1px solid #ddd;
            padding-bottom: 10px;
        }
        h2 {
            margin-top: 30px;
        }
        p {
            margin-bottom: 20px;
        }
        a {
            color: #0077cc;
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
    </style>
    <script async defer src="https://buttons.github.io/buttons.js"></script>
</head>
<body>
    <h1>Legal Information</h1>
    <h2>Terms of Service</h2>
    <p>By using the TimeMachine ChatGPT Plugin, you agree to use it responsibly and in accordance with all applicable laws and regulations.</p>
    <p>The developer reserves the right to suspend or terminate access to the service for any user who violates these terms.</p>
    <h2>Privacy Policy</h2>
    <p>The TimeMachine ChatGPT Plugin does not collect, store, or share any personal data for purposes other than its primary function.</p>
    <p>For analytics and performance monitoring, certain non-personal data (such as request timestamps and headers) is stored in
    Cloudflare's Analytics Engine for a duration of three months. After this period, the data is automatically deleted and is not used for any other purpose.</p>
    <h2>Cookie Policy</h2>
    <p>The TimeMachine ChatGPT Plugin does not use cookies.</p>
    <h2>Open Source</h2>
    <p>This project is open source and licensed under the Apache 2.0 License. You can view the source code, contribute, or report issues and feature requests on GitHub.</p>
    <p>If you find the project useful, please consider supporting it by giving it a star on GitHub:
    <a class="github-button" href="https://github.com/lroolle/timemachine" data-show-count="true" aria-label="Star lroolle/timemachine on GitHub">Star</a>
    </p>
    <h2>Contact</h2>
    <p>If you have any questions or concerns about our legal policies, please contact at <a href="mailto:${CONTACT_ME}">${CONTACT_ME}</a>.</p>
</body>
</html>
`
