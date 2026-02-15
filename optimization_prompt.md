I want to optimize this code for the efficiency of execution time.

You need to consider the following
1. Operation time in TypeScript, sometimes, even if the complexity is low, the operation takes a lot of overhead, which might have a negative effect
2. Use efficient data structures like type array instead of number array, as the program might need to handle significantly large cases.
3. If the code needs to query multiple times, you might consider memory and pre-compute the task for a fast O(1) query.  And store outside the function. Like prefix sum or factor
4. In most cases, math can help to solve it by combining!
5. Consider the constraint, designing a well-fit solution is better
6. Do not change the main function name/function parameter, as it may invoke an error
7. Use a full name other than a shortcut for readability
8. If commenting on a function/method, please use JSDoc with params and return (Only use return if you have no void return)
9. Please use a meaningful comment in a single line at an important step
10. Avoid using a single line if or for statement for readability

Now consider the question and the following code; try to optimize it as fast as possible.
Your task will be marked as a failure if your run time performance is worse than the base code.

The following is the base code and the question
---
{Question}

{Constraints}

{Last Attempt Best Solution}
