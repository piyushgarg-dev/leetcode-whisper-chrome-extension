import { platform } from "./interface/PlatformInterface"

// import the platform providers here
import leetcodePlatform from "./platforms/leetcode";

/**
 * Factory function that returns an instance of the appropriate platform class
 * based on the current URL. This function checks the URL to determine which
 * coding platform the user is on (e.g., LeetCode, Codeforces) and then
 * provides the correct subclass of the `Platform` abstract class to interact with.
 * 
 * @returns An instance of a subclass of the `Platform` class, tailored for
 *          the platform detected from the current URL (e.g., `LeetCodePlatform`).
 *          The returned class will have methods to fetch problem name, statement,
 *          user code, and programming language specific to the detected platform.
 */
function factoryBuilder(): platform{
    

    const currentUrl = window.location.href;

    // Check if the URL matches a known platform's URL pattern
    if (currentUrl.includes("leetcode.com")) {
        // If the platform is LeetCode, return an instance of LeetCodePlatform
        return new leetcodePlatform();
    } 
  
    // Handle other platforms' URL patterns and return the appropriate platform class instances
    // Add additional 'else if' statements below to detect other platforms like Codeforces, HackerRank, etc.
    // For example:
    //
    // if (currentUrl.includes("codeforces.com")) {
    //   // If the platform is Codeforces, return an instance of CodeforcesPlatform
    //   return new CodeforcesPlatform();
    // }
    //
    // if (currentUrl.includes("hackerrank.com")) {
    //   // If the platform is HackerRank, return an instance of HackerRankPlatform
    //   return new HackerRankPlatform();
    // }
    //
    // Repeat this pattern for each supported platform, adjusting the URL check and the corresponding platform class.

 
 
    return  new leetcodePlatform();
    
}

export default factoryBuilder