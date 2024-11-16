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

export function programmingLanguageMapping(programmingLanguage: string) {
  console.log({ programmingLanguage });
  switch (programmingLanguage) {
    case "cpp":
      return "C++";
    case "java":
      return "Java";
    case "python":
      return "Python";
    case "python3":
      return "Python3";
    case "c":
      return "C";
    case "csharp":
      return "C#";
    case "javascript":
      return "JavaScript";
    case "typescript":
      return "TypeScript";
    case "php":
      return "PHP";
    case "swift":
      return "Swift";
    case "kotlin":
      return "Kotlin";
    case "dart":
      return "Dart";
    case "golang":
      return "Go";
    case "ruby":
      return "Ruby";
    case "scala":
      return "Scala";
    case "rust":
      return "Rust";
    case "racket":
      return "Racket";
    case "erlang":
      return "Erlang";
    case "elixir":
      return "Elixir";
    default:
      return "C++";
  }
}

