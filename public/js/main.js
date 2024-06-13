document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('txtFile');
    const contentSummaryElem = document.getElementById('content-summary');
    const uploadLabel = document.getElementById('uploadLabel');
    const dotsContainer = document.querySelector('.dots-container');
    const copyIcon = document.getElementById('copyIcon');

    contentSummaryElem.textContent = 'Empty Content. Upload your .txt file for the AI to summarize it.';
    dotsContainer.style.display = 'none';

    fileInput.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (file) {
            uploadLabel.textContent = file.name;
            dotsContainer.style.display = 'flex';
            copyIcon.style.display = 'none';

            const formData = new FormData();
            formData.append('file', file);

            try {
                const response = await fetch('/summarize', { method: 'POST', body: formData });

                dotsContainer.style.display = 'none';

                if (response.ok) {
                    const summary = await response.text();
                    const formattedSummary = formatText(summary);
                    contentSummaryElem.innerHTML = formattedSummary;
                    copyIcon.style.display = 'block';
                } else {
                    const errorText = await response.text();
                    contentSummaryElem.textContent = `Error: ${errorText}`;
                }
            } catch (error) {
                dotsContainer.style.display = 'none';
                contentSummaryElem.textContent = 'Error generating summary';
                console.error('Error:', error);
            }
        }
    });

    copyIcon.addEventListener('click', () => {
        const summaryText = contentSummaryElem.innerText;
        navigator.clipboard.writeText(summaryText).then(() => {
            console.log('Summary copied to clipboard');
        }).catch(err => {
            console.error(`Error copying to clipboard: ${err}`);
        });
    });
});

function formatText(text) {
    const paragraphs = text.split('\n\n');
    const formattedText = paragraphs.map(paragraph => `<p>${paragraph}</p>`).join('');
    return formattedText;
}
