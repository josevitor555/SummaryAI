document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('txtFile');
    const contentSummaryElem = document.getElementById('content-summary');
    const uploadLabel = document.getElementById('uploadLabel');
    const dotsContainer = document.querySelector('.dots-container');
  
    fileInput.addEventListener('change', async (event) => {

        const file = event.target.files[0];
        if (file) {
            uploadLabel.textContent = file.name;
    
            const formData = new FormData();
            formData.append('file', file);
    
            try {
                dotsContainer.style.display = 'flex';
        
                const response = await fetch('/summarize', {
                    method: 'POST',
                    body: formData,
                });
        
                if (response.ok) {
                    const summary = await response.text();
                    const formattedSummary = formatText(summary);
                    contentSummaryElem.innerHTML = formattedSummary;
                } else {
                    const errorText = await response.text();
                    contentSummaryElem.textContent = `Error: ${errorText}`;
                }
            } catch (error) {
                contentSummaryElem.textContent = 'Error generating summary';
                console.error('Error:', error);
            } finally {
                dotsContainer.style.display = 'none';
            }
        }
    });
});
  
function formatText(text) {
    text = text.replace(/\*/g, ' ');
  
    const paragraphs = text.split('\n\n');
    const formattedText = paragraphs.map(paragraph => `<p>${paragraph}</p>`).join('');
    
    return formattedText;
}
  