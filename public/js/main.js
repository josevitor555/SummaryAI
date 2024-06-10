document.addEventListener('DOMContentLoaded', () => {
  const fileInput = document.getElementById('txtFile');
  const contentSummaryElem = document.getElementById('content-summary');
  const uploadLabel = document.getElementById('uploadLabel');

  contentSummaryElem.textContent = 'Empty Content. Upload your .txt file for the AI ​​to summarize it.';

  fileInput.addEventListener('change', async (event) => {
      const file = event.target.files[0];
      if (file) {
          uploadLabel.textContent = file.name;

          const formData = new FormData();
          formData.append('file', file);

          try {
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
          }
      }
  });
});

function formatText(text) {
  // Split text into paragraphs
  const paragraphs = text.split('\n\n');
  
  // Join paragraphs with <p> tags
  const formattedText = paragraphs.map(paragraph => `<p>${paragraph}</p>`).join('');
  
  return formattedText;
}