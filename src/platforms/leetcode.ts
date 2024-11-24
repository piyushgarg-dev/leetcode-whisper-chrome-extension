import { platform } from "@/interface/PlatformInterface";

class leetcodePlatform extends platform {

    // supporting funtion

    private extractCode(htmlContent: NodeListOf<Element>) {
     // Extract the text content of each line with the 'view-line' class
     const code = Array.from(htmlContent)
     .map((line) => line.textContent || '') // Ensure textContent is not null
     .join('\n');

       return code
    }

    // main funtion of the abstract class

    getProblemName(): string {
         const url = window.location.href
         const match = /\/problems\/([^/]+)/.exec(url)
         return match ? `leetcode-${match[1]}` : 'leetcode Unknown Problem'
    }

    getProblemStatement(): string {
        const metaDescriptionEl = document.querySelector('meta[name=description]')
        const problemStatement = metaDescriptionEl?.getAttribute('content') as string

        return problemStatement
    }

    getUserCode(): string {
        const userCurrentCodeContainer = document.querySelectorAll('.view-line')
        const extractedCode = this.extractCode(userCurrentCodeContainer)
        return extractedCode
    }

    getProgramingLaungage(): string {
        let programmingLanguage = 'UNKNOWN'

       const changeLanguageButton = document.querySelector(
            'button.rounded.items-center.whitespace-nowrap.inline-flex.bg-transparent.dark\\:bg-dark-transparent.text-text-secondary.group'
       )
       if (changeLanguageButton) {
            if (changeLanguageButton.textContent)
                programmingLanguage = changeLanguageButton.textContent
       }
        return programmingLanguage
    }



}

export default leetcodePlatform