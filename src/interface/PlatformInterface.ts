/**
 * Abstract class representing a generic platform that hosts coding problems.
 * This class defines the structure for extracting key information related to
 * a coding problem and the user's submission. Each subclass should implement
 * the methods to fetch or extract the relevant data from the platform.
 */

export abstract class platform {
     
    /**
   * Abstract method to retrieve the name of the problem.
   * This method should be implemented in subclasses to return the name of the problem
   * the user is working on. The exact logic for extracting the problem name depends
   * on the platform being used.
   * 
   * @returns A string representing the problem name.
   */
    abstract getProblemName(): string

    /**
   * Abstract method to retrieve the problem statement.
   * This method should be implemented in subclasses to extract the detailed problem
   * statement from the platform. It usually includes the problem description, 
   * constraints, and other relevant information needed to solve the problem.
   * 
   * @returns A string containing the full problem statement.
   */
    abstract getProblemStatement(): string

    /**
   * Abstract method to retrieve the user's submitted code.
   * This method should be implemented in subclasses to fetch the code the user
   * has written for the problem. The user code may be in various formats depending
   * on the platform (e.g., raw text, code block).
   * 
   * @returns A string representing the user's submitted code.
   */
    abstract getUserCode(): string

    /**
   * Abstract method to retrieve the programming language used by the user.
   * This method should be implemented in subclasses to extract the programming language
   * the user has selected or used to solve the problem. The platform may store the language
   * as part of the submission metadata.
   * 
   * @returns A string representing the programming language used (e.g., "JavaScript", "Python").
   */
    abstract getProgramingLaungage(): string
    
    
}