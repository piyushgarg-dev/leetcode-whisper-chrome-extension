export function extractCode(htmlContent: string) {
  // Create a temporary DOM element to parse the HTML content
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = htmlContent

  // Select all elements with the 'view-line' class
  const codeLines = tempDiv.querySelectorAll('.view-line')

  // Extract the text content of each line and join them with newline characters
  const code = Array.from(codeLines)
    .map((line) => line.textContent)
    .join('\n')

  return code
}
