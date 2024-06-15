document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('txtFile');
    const contentSummaryElem = document.getElementById('content-summary');
    const uploadLabel = document.getElementById('uploadLabel');
    const dotsContainer = document.querySelector('.dots-container');
    const copyIcon = document.getElementById('copyIcon');
    const audioIcon = document.getElementById('audioIcon');

    dotsContainer.style.display = 'none';
    fileInput.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (file) {
            uploadLabel.textContent = file.name;
            dotsContainer.style.display = 'flex';
            copyIcon.style.display = 'none';
            audioIcon.style.display = 'none';

            const formData = new FormData();
            formData.append('file', file);

            try {
                const response = await fetch('/summarize', { method: 'POST', body: formData });
                dotsContainer.style.display = 'none';

                if (response.ok) {
                    const data = await response.json();
                    const { summary, audioUrl } = data;
                    const formattedSummary = formatText(summary);
                    contentSummaryElem.innerHTML = formattedSummary;
                    copyIcon.style.display = 'block';
                    audioIcon.style.display = 'block';

                    audioIcon.addEventListener('click', async () => {
                        const audioResponse = await fetch(audioUrl);
                        if (audioResponse.ok) {
                            const blob = await audioResponse.blob();
                            const audio = new Audio(URL.createObjectURL(blob));
                            audio.play();
                        } else {
                            const errorText = await audioResponse.text();
                            console.error(`Error: ${errorText}`);
                        }
                    });
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
    const cleanedText = text.replace(/\*/g, ''); // Remove all asterisks
    const paragraphs = cleanedText.split('\n\n');
    const formattedText = paragraphs.map(paragraph => `<p style="text-align: justify;">${paragraph}</p>`).join('');
    return formattedText;
}
