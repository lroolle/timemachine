export const CONTACT_ME: string = 'hello@promptspellsmith.com';

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
    <h1>Usage Guide</h1>
    <h2>Getting Started</h2>
    <p>The TimeMachine ChatGPT Plugin offers functionalities related to time data, as well as backup and restore capabilities for conversations.</p>
    <p>Quick Start from Continue this conversation: <a href="https://chat.openai.com/share/4fee1bfe-e5bb-4aa5-ac52-169210d8d1e4">TimeMachine Auto Testing Bot</a></p>
    <h2>Time Data</h2>
    <p>Users can request the current time in various formats and timezones. Simply ask the model for the current time, specifying your desired format and timezone if necessary.</p>

    <h3>Example Prompts:</h3>
    <ul>
        <li>What time is it now in Japan?</li>
        <li>I have a meeting with my international colleague at 9:00 AM PST. Currently, I'm in Hawaii. What time should I schedule it in my calendar?</li>
    </ul>

    <h2>Backup and Restore</h2>
    <p>With the backup feature, users can save their conversation content for future reference. To backup a conversation, provide the content you wish to save along with a set of keywords or key points for referencing.</p>
    <p>To restore a conversation, specify the timestamp of the backup entry you wish to retrieve. If no timestamp is provided, the latest backup will be restored by default.</p>
    <p><strong>Note:</strong> The backup feature is experimental. Users are advised to be cautious and avoid backing up sensitive or private content. Backups are automatically deleted after 1 month of inactivity.</p>

    <h3>Example Prompts:</h3>
    <ul>
        <li>Backup this conversation starting from 'hello time hackers' to the end of this message;</li>
        <li>Preview <b>\`bc847092-6039-51aa-bc47-afee863ed065\`</b> and restore the first backup;</li>
    </ul>

    <h2>Flush</h2>
    <p>If you wish to remove all backups of a conversation, you can use the flush feature. This will permanently delete all backup entries associated with the specified conversation.</p>

    <h1>Legal Information</h1>
    <h2>Terms of Service</h2>
    <p>By using the TimeMachine ChatGPT Plugin, you agree to use it responsibly and in accordance with all applicable laws and regulations.</p>
    <p>The developer reserves the right to suspend or terminate access to the service for any user who violates these terms.</p>
    <h2>Privacy Policy</h2>
    <p>The TimeMachine ChatGPT Plugin does not collect, store, or share any personal data for purposes other than its primary function.</p>
    <p>Backup Feature: Conversations backed up using the TimeMachine are stored temporarily and are automatically deleted after 1 month of inactivity. We prioritize user privacy and data security, and we do not guarantee complete privacy. Users are advised not to backup sensitive content.</p>
    <p>For analytics and performance monitoring, certain non-personal data (such as request timestamps and headers) is stored in Cloudflare's Analytics Engine for a duration of three months. After this period, the data is automatically deleted and is not used for any other purpose.</p>
    <h2>Cookie Policy</h2>
    <p>The TimeMachine ChatGPT Plugin does not use cookies.</p>
    <h2>Open Source</h2>
    <p>This project is open source and licensed under the Apache 2.0 License. You can view the source code, contribute, or
      <a href="https://github.com/lroolle/timemachine/issues">report issues and feature requests</a> on GitHub.</p>
    <p>If you find the project useful, please consider supporting it by giving it a star on GitHub:
      <a class="github-button" href="https://github.com/lroolle/timemachine" data-show-count="true" aria-label="Star lroolle/timemachine on GitHub">Star</a>
    </p>
    <h2>Contact</h2>
    <p>If you have any questions or concerns about our legal policies, please contact at <a href="mailto:${CONTACT_ME}">${CONTACT_ME}</a>.</p>
</body>
</html>
`;
