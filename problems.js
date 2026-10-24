/* =====================================================================
   problems.js  —  THE TOPIC LIST AND PROBLEM BANK
   ---------------------------------------------------------------------
   This file holds ONLY data (no screen logic). To add a topic or a
   problem you normally edit this file and nothing else.

   PROBLEM SCHEMA (every problem object uses these fields):

     id                 Unique text id, e.g. "fn-1". Used in the URL.
     topic              The id of a topic in TOPICS (e.g. "functions").
     title              Short name shown in lists.
     difficulty         "Beginner" | "Intermediate" | "Advanced".
     question           The problem statement (HTML allowed).
     prompt             A Socratic "before you start" question.
     answerType         How the student's answer is checked:
                          "number"  → one numeric value
                          "set"     → several values, any order (e.g. "3, -3")
                          "choice"  → multiple choice (see `choices`)
     answer             The final answer exactly as we DISPLAY it.
     acceptedAnswers    Strings the checker treats as correct.
                        For "number"/"set" each string is parsed as a
                        number, so "3/2" also accepts 1.5, x = 1.5, etc.
                        For "choice" this is the id of the correct choice.
     choices            (choice only) [{ id, text, feedback }].
     inputHint          Placeholder text inside the answer box.
     hints              Progressive hints, smallest nudge first.
                        Hints must NEVER state the final answer.
     given              "What is given?"
     find               "What are we trying to find?"
     concept            "Which concept applies?"
     solutionSteps      Ordered worked steps. The LAST step must be the
                        one that states the final answer, because the
                        "Next Step" walkthrough stops just before it.
     finalExplanation   One-sentence "key idea" summary.
     verification       How to check the answer.
     commonMistake      The mistake to watch out for.
     misconceptions     (optional) [{ answers: [...], feedback }] —
                        typical WRONG answers with targeted feedback.
     practiceProblemId  The id of a similar problem to try next.
   ===================================================================== */

(function () {
  "use strict";

  // -------------------------------------------------------------------
  // Tiny helpers that build readable math HTML (no library needed).
  // -------------------------------------------------------------------

  // Remove HTML tags so we can make a plain-text label for screen readers.
  function plain(html) {
    return String(html).replace(/<[^>]*>/g, "");
  }

  // frac("a", "b") draws a stacked fraction: a on top, b underneath.
  // Screen readers hear "a over b" instead of the two pieces separately.
  function frac(num, den) {
    return (
      '<span class="frac" role="img" aria-label="' + plain(num) + " over " + plain(den) + '">' +
      '<span class="num" aria-hidden="true">' + num + "</span>" +
      '<span class="den" aria-hidden="true">' + den + "</span>" +
      "</span>"
    );
  }

  // root("3") draws √3 with a bar over the 3.
  function root(x) {
    return (
      '<span class="sqrt" role="img" aria-label="square root of ' + plain(x) + '">' +
      '<span aria-hidden="true">√</span><span class="radicand" aria-hidden="true">' + x + "</span>" +
      "</span>"
    );
  }

  // m("...") marks a piece of text as mathematics (serif font, no wrapping).
  function m(html) {
    return '<span class="math">' + html + "</span>";
  }

  // -------------------------------------------------------------------
  // TOPICS — one entry per topic card.
  //   icon: the name of an icon drawn in app.js (see TOPIC_ICONS there).
  // -------------------------------------------------------------------
  var TOPICS = [
    {
      id: "functions",
      name: "Functions",
      icon: "functions",
      difficulty: "Beginner",
      description: "Evaluate, combine, and reverse functions — the language the rest of math is written in."
    },
    {
      id: "rational",
      name: "Rational Functions",
      icon: "rational",
      difficulty: "Intermediate",
      description: "Solve rational equations and read asymptotes, holes, and zeros without falling into traps."
    },
    {
      id: "explog",
      name: "Exponential & Logarithmic",
      icon: "explog",
      difficulty: "Intermediate",
      description: "Match bases, convert logs to exponents, and solve equations with powers."
    },
    {
      id: "trig",
      name: "Basic Trigonometry",
      icon: "trig",
      difficulty: "Beginner",
      description: "Use SOH-CAH-TOA and the special right triangles to find exact trig values."
    },
    {
      id: "sequences",
      name: "Sequences & Series",
      icon: "sequences",
      difficulty: "Intermediate",
      description: "Find terms and sums of arithmetic and geometric patterns — even infinite ones."
    },
    {
      id: "probstat",
      name: "Probability & Statistics",
      icon: "probstat",
      difficulty: "Beginner",
      description: "Count outcomes, compute probabilities, and find means and expected values."
    }
  ];

  // -------------------------------------------------------------------
  // PROBLEMS — four per topic, arranged as two "similar pairs" so the
  // "Try Another Problem" button can offer a matching practice problem.
  // Every answer below is independently re-computed by tests/verify.js.
  // -------------------------------------------------------------------
  var PROBLEMS = [
    /* ============================ FUNCTIONS ============================ */
    {
      id: "fn-1",
      topic: "functions",
      title: "Evaluating a Function",
      difficulty: "Beginner",
      question: "If " + m("f(x) = 2x² − 3x + 1") + ", find " + m("f(−2)") + ".",
      prompt: "What does " + m("f(−2)") + " tell you to do with the number −2?",
      answerType: "number",
      answer: "15",
      acceptedAnswers: ["15"],
      inputHint: "e.g. 7",
      hints: [
        "The notation " + m("f(−2)") + " means “the output when the input is −2.” What should you do with every " + m("x") + " in the rule?",
        "Substitute using parentheses so the signs stay safe: " + m("f(−2) = 2(−2)² − 3(−2) + 1") + ".",
        "Work in order: " + m("(−2)² = 4") + ", so the first term is " + m("2 · 4 = 8") + ". What is " + m("−3(−2)") + "?"
      ],
      given: "The rule " + m("f(x) = 2x² − 3x + 1") + " and the input " + m("x = −2") + ".",
      find: "The output value " + m("f(−2)") + ".",
      concept: "Function evaluation: replace every " + m("x") + " with the input, then simplify using the order of operations.",
      solutionSteps: [
        "Replace each " + m("x") + " with " + m("(−2)") + ": " + m("f(−2) = 2(−2)² − 3(−2) + 1") + ".",
        "Square first: " + m("(−2)² = 4") + ", so " + m("2(4) = 8") + ".",
        "Multiply the middle term: " + m("−3(−2) = +6") + ".",
        "Add everything: " + m("8 + 6 + 1 = 15") + ". So " + m("f(−2) = 15") + "."
      ],
      finalExplanation: "Substituting with parentheses keeps negative inputs under control.",
      verification: "Type it into a calculator with the parentheses: " + m("2*(−2)^2 − 3*(−2) + 1") + " gives 15.",
      commonMistake: "Writing " + m("−2²") + " instead of " + m("(−2)²") + ". " + m("−2²") + " means " + m("−(2²) = −4") + ", which leads to a wrong answer of −1.",
      misconceptions: [
        { answers: ["-1"], feedback: "It looks like (−2)² was treated as −4. Squaring a negative number gives a positive result: (−2)² = 4." },
        { answers: ["3"], feedback: "Check the middle term: −3 times −2 is positive 6, not −6." }
      ],
      practiceProblemId: "fn-2"
    },
    {
      id: "fn-2",
      topic: "functions",
      title: "Composite Functions",
      difficulty: "Beginner",
      question: "Given " + m("f(x) = 3x − 4") + " and " + m("g(x) = x² + 1") + ", find " + m("(f ∘ g)(2)") + ".",
      prompt: "In " + m("(f ∘ g)(2)") + ", which function works on the number 2 first?",
      answerType: "number",
      answer: "11",
      acceptedAnswers: ["11"],
      inputHint: "e.g. 7",
      hints: [
        m("(f ∘ g)(2)") + " means " + m("f(g(2))") + ". Work from the inside out — which function do you evaluate first?",
        "Start with the inner function: " + m("g(2) = 2² + 1") + ". What number is that?",
        "Now feed that result into " + m("f") + ": " + m("f(5) = 3(5) − 4") + "."
      ],
      given: m("f(x) = 3x − 4") + ", " + m("g(x) = x² + 1") + ", and the input 2.",
      find: "The value of the composite function " + m("(f ∘ g)(2)") + ".",
      concept: "Composition: the output of the inner function " + m("g") + " becomes the input of the outer function " + m("f") + ".",
      solutionSteps: [
        "Rewrite the notation: " + m("(f ∘ g)(2) = f(g(2))") + ".",
        "Evaluate the inner function: " + m("g(2) = 2² + 1 = 5") + ".",
        "Evaluate the outer function at that result: " + m("f(5) = 3(5) − 4 = 11") + ". So " + m("(f ∘ g)(2) = 11") + "."
      ],
      finalExplanation: "In a composition, always work from the inside out.",
      verification: "Build the composite rule first: " + m("f(g(x)) = 3(x² + 1) − 4 = 3x² − 1") + ". Then " + m("3(2)² − 1 = 11") + ". ✓",
      commonMistake: "Doing it in the wrong order. " + m("g(f(2))") + " is a different calculation, and " + m("(f ∘ g)(2)") + " is not " + m("f(2) · g(2)") + ".",
      misconceptions: [
        { answers: ["5"], feedback: "5 is g(2) — the inner step. Now feed it into f to finish." },
        { answers: ["10"], feedback: "It looks like f(2) and g(2) were multiplied. The ∘ symbol means composition (plug one into the other), not multiplication." }
      ],
      practiceProblemId: "fn-1"
    },
    {
      id: "fn-3",
      topic: "functions",
      title: "Using an Inverse Function",
      difficulty: "Intermediate",
      question: "Let " + m("f(x) = " + frac("2x + 3", "5")) + ". Find " + m("f<sup>−1</sup>(7)") + ".",
      prompt: "If " + m("f") + " gives an output of 7, what question is " + m("f<sup>−1</sup>(7)") + " asking?",
      answerType: "number",
      answer: "16",
      acceptedAnswers: ["16"],
      inputHint: "e.g. 12",
      hints: [
        m("f<sup>−1</sup>(7)") + " asks: which input " + m("x") + " makes " + m("f(x) = 7") + "? You can solve that equation directly.",
        "Set up the equation " + m(frac("2x + 3", "5") + " = 7") + ". How can you get rid of the denominator?",
        "Multiply both sides by 5 to get " + m("2x + 3 = 35") + ". Now isolate " + m("x") + "."
      ],
      given: m("f(x) = " + frac("2x + 3", "5")) + ".",
      find: "The input whose output is 7, written " + m("f<sup>−1</sup>(7)") + ".",
      concept: "An inverse function reverses the original: if " + m("f(a) = b") + ", then " + m("f<sup>−1</sup>(b) = a") + ".",
      solutionSteps: [
        "Since " + m("f<sup>−1</sup>(7)") + " is the input that gives 7, solve " + m(frac("2x + 3", "5") + " = 7") + ".",
        "Multiply both sides by 5: " + m("2x + 3 = 35") + ".",
        "Subtract 3 from both sides: " + m("2x = 32") + ". (Equivalently, the inverse rule is " + m("f<sup>−1</sup>(x) = " + frac("5x − 3", "2")) + ".)",
        "Divide by 2: " + m("x = 16") + ". So " + m("f<sup>−1</sup>(7) = 16") + "."
      ],
      finalExplanation: "Evaluating an inverse means asking “which input produced this output?”",
      verification: "Check with the original function: " + m("f(16) = " + frac("2(16) + 3", "5") + " = " + frac("35", "5") + " = 7") + ". ✓",
      commonMistake: "Reading " + m("f<sup>−1</sup>(7)") + " as " + m(frac("1", "f(7)")) + ". The −1 is not an exponent here; it names the inverse function.",
      misconceptions: [
        { answers: ["5/17"], feedback: "That's 1 ÷ f(7). The “−1” in f⁻¹ names the inverse function — it isn't an exponent." },
        { answers: ["17/5"], feedback: "That's f(7) — the original function. The inverse goes the other way: find the input that gives 7." }
      ],
      practiceProblemId: "fn-4"
    },
    {
      id: "fn-4",
      topic: "functions",
      title: "Inverse Function Practice",
      difficulty: "Intermediate",
      question: "Let " + m("f(x) = " + frac("x − 4", "3")) + ". Find " + m("f<sup>−1</sup>(5)") + ".",
      prompt: "What equation could you solve to find the input that gives an output of 5?",
      answerType: "number",
      answer: "19",
      acceptedAnswers: ["19"],
      inputHint: "e.g. 12",
      hints: [
        m("f<sup>−1</sup>(5)") + " is the input that makes " + m("f(x) = 5") + ". Write that equation.",
        "Solve " + m(frac("x − 4", "3") + " = 5") + ". What should you multiply both sides by?",
        "After multiplying by 3 you get " + m("x − 4 = 15") + ". One more step!"
      ],
      given: m("f(x) = " + frac("x − 4", "3")) + ".",
      find: "The value " + m("f<sup>−1</sup>(5)") + ".",
      concept: "An inverse function undoes the original: solve " + m("f(x) = 5") + " for " + m("x") + ".",
      solutionSteps: [
        "Set the function equal to 5: " + m(frac("x − 4", "3") + " = 5") + ".",
        "Multiply both sides by 3: " + m("x − 4 = 15") + ". (The inverse rule is " + m("f<sup>−1</sup>(x) = 3x + 4") + ".)",
        "Add 4 to both sides: " + m("x = 19") + ". So " + m("f<sup>−1</sup>(5) = 19") + "."
      ],
      finalExplanation: "Undo the operations of " + m("f") + " in reverse order: first undo “÷ 3”, then undo “− 4”.",
      verification: m("f(19) = " + frac("19 − 4", "3") + " = " + frac("15", "3") + " = 5") + ". ✓",
      commonMistake: "Computing " + m("f(5)") + " instead of " + m("f<sup>−1</sup>(5)") + ", or undoing the operations in the wrong order.",
      misconceptions: [
        { answers: ["1/3"], feedback: "That's f(5), the original function. For the inverse, find the input that gives an output of 5." },
        { answers: ["3"], feedback: "That's 1 ÷ f(5). The −1 in f⁻¹ is not an exponent — it means the inverse function." }
      ],
      practiceProblemId: "fn-3"
    },

    /* ======================== RATIONAL FUNCTIONS ======================= */
    {
      id: "rf-1",
      topic: "rational",
      title: "Solving a Rational Equation",
      difficulty: "Intermediate",
      question: "Solve for " + m("x") + ": " + m(frac("3", "x − 2") + " = " + frac("6", "x + 1")) + ".",
      prompt: "Before solving: which values of " + m("x") + " are NOT allowed here, and why?",
      answerType: "number",
      answer: "x = 5",
      acceptedAnswers: ["5"],
      inputHint: "e.g. x = 4",
      hints: [
        "First note the restrictions: denominators can't be zero, so " + m("x ≠ 2") + " and " + m("x ≠ −1") + ". Then, how can you clear the fractions?",
        "Cross-multiply: " + m("3(x + 1) = 6(x − 2)") + ".",
        "Expand both sides: " + m("3x + 3 = 6x − 12") + ". Collect the " + m("x") + "-terms on one side."
      ],
      given: "The equation " + m(frac("3", "x − 2") + " = " + frac("6", "x + 1")) + ".",
      find: "All values of " + m("x") + " that make the equation true.",
      concept: "Rational equations: clear denominators (here by cross-multiplying), solve, then check against the restrictions.",
      solutionSteps: [
        "State restrictions: " + m("x ≠ 2") + " and " + m("x ≠ −1") + ".",
        "Cross-multiply: " + m("3(x + 1) = 6(x − 2)") + ".",
        "Distribute: " + m("3x + 3 = 6x − 12") + ".",
        "Move terms: " + m("3 + 12 = 6x − 3x") + ", so " + m("15 = 3x") + ".",
        "Divide by 3: " + m("x = 5") + ". It is not a restricted value, so the solution is " + m("x = 5") + "."
      ],
      finalExplanation: "Clear the fractions, solve the simpler equation, and always check the restrictions.",
      verification: "Left side: " + m(frac("3", "5 − 2") + " = 1") + ". Right side: " + m(frac("6", "5 + 1") + " = 1") + ". Both equal 1. ✓",
      commonMistake: "Distributing only to the first term, e.g. writing " + m("6(x − 2) = 6x − 2") + ". The 6 multiplies both terms: " + m("6x − 12") + ".",
      misconceptions: [
        { answers: ["5/3"], feedback: "Check your distribution: 6(x − 2) = 6x − 12, not 6x − 2." }
      ],
      practiceProblemId: "rf-2"
    },
    {
      id: "rf-2",
      topic: "rational",
      title: "Watch for Extraneous Solutions",
      difficulty: "Advanced",
      question: "Solve for " + m("x") + ": " + m(frac("x", "x − 3") + " + 2 = " + frac("3", "x − 3")) + ".",
      prompt: "Which value of " + m("x") + " would make a denominator equal to zero?",
      answerType: "choice",
      answer: "No solution (x = 3 is extraneous)",
      acceptedAnswers: ["d"],
      choices: [
        { id: "a", text: "x = 3", feedback: "That's what the algebra produces — but substitute it into the original equation. What happens to x − 3?" },
        { id: "b", text: "x = −3", feedback: "Re-check your signs. Clearing the fractions should give 3x − 6 = 3." },
        { id: "c", text: "x = 1", feedback: "Check the step where you distribute: 2(x − 3) = 2x − 6." },
        { id: "d", text: "No solution", feedback: "" }
      ],
      inputHint: "",
      hints: [
        "Start with the restriction: " + m("x − 3 ≠ 0") + ", so " + m("x ≠ 3") + ". Keep that in mind until the very end.",
        "Multiply every term by " + m("(x − 3)") + " to clear the fractions: " + m("x + 2(x − 3) = 3") + ".",
        "Simplify to get " + m("3x − 6 = 3") + ". Solve it — then compare your result with the restriction from Hint 1."
      ],
      given: "The equation " + m(frac("x", "x − 3") + " + 2 = " + frac("3", "x − 3")) + ".",
      find: "All values of " + m("x") + " that make the equation true (if any).",
      concept: "Extraneous solutions: multiplying by an expression containing " + m("x") + " can create “solutions” that make the original denominators zero.",
      solutionSteps: [
        "Restriction: " + m("x ≠ 3") + ".",
        "Multiply every term by " + m("(x − 3)") + ": " + m("x + 2(x − 3) = 3") + ".",
        "Simplify: " + m("3x − 6 = 3") + ", so " + m("3x = 9") + " and " + m("x = 3") + ".",
        "But " + m("x = 3") + " is the restricted value — it makes the denominators zero. It is extraneous, so the equation has <strong>no solution</strong>."
      ],
      finalExplanation: "An answer that breaks a restriction must be rejected, even if the algebra produced it.",
      verification: "Substitute " + m("x = 3") + ": " + m(frac("3", "3 − 3") + " = " + frac("3", "0")) + ", which is undefined. So 3 is not a solution, and no other value is.",
      commonMistake: "Stopping at " + m("x = 3") + " without checking it in the original equation.",
      practiceProblemId: "rf-1"
    },
    {
      id: "rf-3",
      topic: "rational",
      title: "Horizontal Asymptote",
      difficulty: "Intermediate",
      question: "Find the horizontal asymptote of " + m("f(x) = " + frac("6x² − 1", "3x² + 5x")) + ".",
      prompt: "Compare the highest powers of " + m("x") + " on the top and bottom. What do you notice?",
      answerType: "number",
      answer: "y = 2",
      acceptedAnswers: ["2"],
      inputHint: "e.g. y = 4",
      hints: [
        "For horizontal asymptotes, compare the degree (highest power of " + m("x") + ") of the numerator and the denominator.",
        "Both have degree 2. When the degrees are equal, the asymptote is " + m("y = " + frac("leading coefficient of top", "leading coefficient of bottom")) + ".",
        "The leading coefficients are 6 (top) and 3 (bottom)."
      ],
      given: m("f(x) = " + frac("6x² − 1", "3x² + 5x")) + ".",
      find: "The horizontal line " + m("y = k") + " that the graph approaches as " + m("x") + " becomes very large.",
      concept: "Horizontal asymptote rule: equal degrees → divide the leading coefficients.",
      solutionSteps: [
        "Degree of the numerator: 2. Degree of the denominator: 2. They are equal.",
        "Leading coefficients: 6 in the numerator and 3 in the denominator.",
        "Divide: " + m(frac("6", "3") + " = 2") + ". The horizontal asymptote is " + m("y = 2") + "."
      ],
      finalExplanation: "For large " + m("x") + ", only the highest-power terms matter, so " + m("f(x) ≈ " + frac("6x²", "3x²") + " = 2") + ".",
      verification: "Try a large input: " + m("f(1000) = " + frac("5,999,999", "3,005,000") + " ≈ 1.997") + ", very close to 2. ✓",
      commonMistake: "Using constant terms or flipping the fraction. Only the leading coefficients matter, top over bottom.",
      misconceptions: [
        { answers: ["0"], feedback: "y = 0 is the rule when the numerator's degree is SMALLER. Here both degrees are 2." },
        { answers: ["1/2"], feedback: "The fraction is flipped. Divide the TOP leading coefficient by the BOTTOM one." }
      ],
      practiceProblemId: "rf-4"
    },
    {
      id: "rf-4",
      topic: "rational",
      title: "Zeros vs. Holes",
      difficulty: "Advanced",
      question: "Find all zeros (x-intercepts) of " + m("f(x) = " + frac("x² − 9", "x + 3")) + ".",
      prompt: "A zero is where " + m("f(x) = 0") + ". When is a fraction equal to zero?",
      answerType: "set",
      answer: "x = 3",
      acceptedAnswers: ["3"],
      inputHint: "e.g. 2  (separate several with commas)",
      hints: [
        "A fraction equals zero when its numerator is zero AND its denominator is not zero.",
        "Factor the numerator: " + m("x² − 9 = (x − 3)(x + 3)") + ". Which " + m("x") + "-values make it zero?",
        "The numerator is zero at two values, but one of them also makes the denominator zero. Which one must you reject?"
      ],
      given: m("f(x) = " + frac("x² − 9", "x + 3")) + ".",
      find: "Every " + m("x") + " where the graph crosses the x-axis.",
      concept: "Zeros of a rational function come from the numerator, but values that make the denominator zero are excluded (they create holes or asymptotes).",
      solutionSteps: [
        "Factor: " + m("f(x) = " + frac("(x − 3)(x + 3)", "x + 3")) + ".",
        "The numerator is zero when " + m("x = 3") + " or " + m("x = −3") + ".",
        "But " + m("x = −3") + " makes the denominator zero, so " + m("f(−3)") + " is undefined. It is a hole at " + m("(−3, −6)") + ", not a zero.",
        "The only zero is " + m("x = 3") + "."
      ],
      finalExplanation: "Check every candidate zero against the denominator before accepting it.",
      verification: m("f(3) = " + frac("9 − 9", "3 + 3") + " = " + frac("0", "6") + " = 0") + " ✓, while " + m("f(−3) = " + frac("0", "0")) + " is undefined.",
      commonMistake: "Listing both 3 and −3. A value that makes the denominator zero can never be a zero of the function.",
      misconceptions: [
        { answers: ["3, -3"], feedback: "Almost! x = −3 makes the denominator zero, so f(−3) is undefined — that's a hole in the graph, not a zero." },
        { answers: ["-3"], feedback: "At x = −3 the denominator is zero, so the function isn't even defined there. Look at the other factor." }
      ],
      practiceProblemId: "rf-3"
    },

    /* =================== EXPONENTIAL & LOGARITHMIC ===================== */
    {
      id: "el-1",
      topic: "explog",
      title: "Exponential Equation (Same Base)",
      difficulty: "Beginner",
      question: "Solve for " + m("x") + ": " + m("2<sup>x + 1</sup> = 32") + ".",
      prompt: "Can you write 32 as a power of 2?",
      answerType: "number",
      answer: "x = 4",
      acceptedAnswers: ["4"],
      inputHint: "e.g. x = 3",
      hints: [
        "Try writing both sides with the same base. 32 is a power of 2 — which power?",
        m("32 = 2<sup>5</sup>") + ", so the equation becomes " + m("2<sup>x + 1</sup> = 2<sup>5</sup>") + ".",
        "If the bases are equal, the exponents must be equal: " + m("x + 1 = 5") + "."
      ],
      given: "The equation " + m("2<sup>x + 1</sup> = 32") + ".",
      find: "The value of " + m("x") + ".",
      concept: "One-to-one property of exponents: if " + m("b<sup>m</sup> = b<sup>n</sup>") + " (with " + m("b > 0, b ≠ 1") + "), then " + m("m = n") + ".",
      solutionSteps: [
        "Rewrite 32 as a power of 2: " + m("32 = 2<sup>5</sup>") + ".",
        "Now " + m("2<sup>x + 1</sup> = 2<sup>5</sup>") + ", so the exponents are equal: " + m("x + 1 = 5") + ".",
        "Subtract 1: " + m("x = 4") + "."
      ],
      finalExplanation: "Same base on both sides → set the exponents equal.",
      verification: m("2<sup>4 + 1</sup> = 2<sup>5</sup> = 32") + ". ✓",
      commonMistake: "Treating the exponent like multiplication (e.g. dividing 32 by 2). Match the powers instead.",
      misconceptions: [
        { answers: ["5"], feedback: "5 is the value of x + 1. Subtract 1 to find x itself." },
        { answers: ["15"], feedback: "It looks like 32 was divided by 2. Exponents aren't multiplication — write 32 as a power of 2 instead." }
      ],
      practiceProblemId: "el-2"
    },
    {
      id: "el-2",
      topic: "explog",
      title: "Exponential Equation (Common Base)",
      difficulty: "Intermediate",
      question: "Solve for " + m("x") + ": " + m("9<sup>x</sup> = 27") + ".",
      prompt: "9 is not a power of 27 (or the other way around), but they share a base. Which base?",
      answerType: "number",
      answer: "x = 3/2",
      acceptedAnswers: ["3/2"],
      inputHint: "a fraction like 2/3 or a decimal",
      hints: [
        "Look for a common base. Both 9 and 27 are powers of 3.",
        "Rewrite: " + m("9 = 3<sup>2</sup>") + " and " + m("27 = 3<sup>3</sup>") + ", so " + m("(3<sup>2</sup>)<sup>x</sup> = 3<sup>3</sup>") + ".",
        "Power of a power: " + m("(3<sup>2</sup>)<sup>x</sup> = 3<sup>2x</sup>") + ". So set " + m("2x = 3") + "."
      ],
      given: "The equation " + m("9<sup>x</sup> = 27") + ".",
      find: "The value of " + m("x") + ".",
      concept: "Rewrite both sides with a common base, then use the one-to-one property of exponents.",
      solutionSteps: [
        "Write both sides as powers of 3: " + m("(3<sup>2</sup>)<sup>x</sup> = 3<sup>3</sup>") + ".",
        "Use the power-of-a-power rule: " + m("3<sup>2x</sup> = 3<sup>3</sup>") + ".",
        "Set the exponents equal: " + m("2x = 3") + ", so " + m("x = " + frac("3", "2")) + " (or 1.5)."
      ],
      finalExplanation: "When the bases don't match, look for a smaller base that both numbers are powers of.",
      verification: m("9<sup>3/2</sup> = (" + root("9") + ")<sup>3</sup> = 3<sup>3</sup> = 27") + ". ✓",
      commonMistake: "Answering " + m("x = 3") + " because " + m("27 = 3<sup>3</sup>") + " — but the left side has base 9, not 3. Rewrite both sides first.",
      misconceptions: [
        { answers: ["3"], feedback: "27 = 3³, but the left side has base 9, not 3. Rewrite 9 as 3² too, then compare exponents." },
        { answers: ["2/3"], feedback: "Close — the fraction is flipped. If 2x = 3, divide both sides by 2." }
      ],
      practiceProblemId: "el-1"
    },
    {
      id: "el-3",
      topic: "explog",
      title: "Evaluating Logarithms",
      difficulty: "Intermediate",
      question: "Evaluate " + m("log<sub>2</sub> 8 + log<sub>3</sub> " + frac("1", "9")) + ".",
      prompt: "In words, what question does " + m("log<sub>2</sub> 8") + " ask?",
      answerType: "number",
      answer: "1",
      acceptedAnswers: ["1"],
      inputHint: "e.g. 4",
      hints: [
        m("log<sub>b</sub> a") + " asks: “" + m("b") + " to what power gives " + m("a") + "?” Answer each logarithm separately.",
        m("log<sub>2</sub> 8") + ": 2 to what power is 8? " + m("log<sub>3</sub> " + frac("1", "9")) + ": 3 to what power is " + m(frac("1", "9")) + "?",
        "Remember negative exponents: " + m("3<sup>−2</sup> = " + frac("1", "3<sup>2</sup>") + " = " + frac("1", "9")) + "."
      ],
      given: "The expression " + m("log<sub>2</sub> 8 + log<sub>3</sub> " + frac("1", "9")) + ".",
      find: "Its numerical value.",
      concept: "Definition of a logarithm: " + m("log<sub>b</sub> a = c") + " means " + m("b<sup>c</sup> = a") + ".",
      solutionSteps: [
        m("log<sub>2</sub> 8 = 3") + " because " + m("2<sup>3</sup> = 8") + ".",
        m("log<sub>3</sub> " + frac("1", "9") + " = −2") + " because " + m("3<sup>−2</sup> = " + frac("1", "9")) + ".",
        "Add: " + m("3 + (−2) = 1") + "."
      ],
      finalExplanation: "A logarithm is just an exponent — and a number between 0 and 1 needs a negative exponent.",
      verification: "Check each piece: " + m("2<sup>3</sup> = 8") + " ✓ and " + m("3<sup>−2</sup> = " + frac("1", "9")) + " ✓. Sum: 1.",
      commonMistake: "Thinking " + m("log<sub>3</sub> " + frac("1", "9")) + " is positive. Because " + m(frac("1", "9")) + " is less than 1, the exponent must be negative.",
      misconceptions: [
        { answers: ["5"], feedback: "Check the sign of log₃(1/9). Since 1/9 is less than 1, the exponent must be negative." }
      ],
      practiceProblemId: "el-4"
    },
    {
      id: "el-4",
      topic: "explog",
      title: "Logarithmic Equation",
      difficulty: "Intermediate",
      question: "Solve for " + m("x") + ": " + m("log<sub>3</sub>(x − 1) = 2") + ".",
      prompt: "Can you rewrite a logarithm statement as an exponent statement?",
      answerType: "number",
      answer: "x = 10",
      acceptedAnswers: ["10"],
      inputHint: "e.g. x = 6",
      hints: [
        "Convert to exponential form: " + m("log<sub>b</sub>(A) = c") + " means " + m("b<sup>c</sup> = A") + ".",
        "Here " + m("b = 3") + ", " + m("c = 2") + ", and " + m("A = x − 1") + ", so " + m("3<sup>2</sup> = x − 1") + ".",
        m("3<sup>2</sup> = 9") + ". Now solve " + m("9 = x − 1") + "."
      ],
      given: "The equation " + m("log<sub>3</sub>(x − 1) = 2") + ".",
      find: "The value of " + m("x") + ".",
      concept: "Convert between logarithmic and exponential form: " + m("log<sub>b</sub> A = c ⇔ b<sup>c</sup> = A") + ".",
      solutionSteps: [
        "Rewrite in exponential form: " + m("3<sup>2</sup> = x − 1") + ".",
        "Evaluate the power: " + m("9 = x − 1") + ".",
        "Add 1 to both sides: " + m("x = 10") + ". (The argument " + m("x − 1 = 9") + " is positive, so the answer is valid.)"
      ],
      finalExplanation: "The base of the logarithm becomes the base of the power.",
      verification: m("log<sub>3</sub>(10 − 1) = log<sub>3</sub> 9 = 2") + " because " + m("3<sup>2</sup> = 9") + ". ✓",
      commonMistake: "Computing " + m("2<sup>3</sup>") + " instead of " + m("3<sup>2</sup>") + ". The base of the log (3) is the base of the power.",
      misconceptions: [
        { answers: ["8"], feedback: "x − 1 = 9 means you ADD 1 to both sides." },
        { answers: ["9"], feedback: "Careful: either 9 is the value of x − 1 (add 1 to get x), or 2³ + 1 was used. The base of the log, 3, is the base of the power: 3² = 9." }
      ],
      practiceProblemId: "el-3"
    },

    /* ======================== BASIC TRIGONOMETRY ======================= */
    {
      id: "tr-1",
      topic: "trig",
      title: "Exact Values (30° and 60°)",
      difficulty: "Beginner",
      question: "Find the exact value of " + m("sin 30° + cos 60°") + ".",
      prompt: "Do you remember the special right triangles: 30°-60°-90° and 45°-45°-90°?",
      answerType: "number",
      answer: "1",
      acceptedAnswers: ["1"],
      inputHint: "e.g. 3/4",
      hints: [
        "Use the 30°-60°-90° triangle with sides 1, " + root("3") + ", and 2 (the hypotenuse is 2).",
        m("sin 30° = " + frac("opposite", "hypotenuse") + " = " + frac("1", "2")) + ". Now find " + m("cos 60° = " + frac("adjacent", "hypotenuse")) + ".",
        "From the 60° angle, the adjacent side is 1 and the hypotenuse is 2."
      ],
      given: "The angles 30° and 60°.",
      find: "The exact value of " + m("sin 30° + cos 60°") + ".",
      concept: "Exact trig values from the 30°-60°-90° triangle (sides 1 : " + root("3") + " : 2).",
      solutionSteps: [
        "In the 30°-60°-90° triangle, the side opposite 30° is 1 and the hypotenuse is 2, so " + m("sin 30° = " + frac("1", "2")) + ".",
        "The side adjacent to 60° is also 1, so " + m("cos 60° = " + frac("1", "2")) + ".",
        "Add: " + m(frac("1", "2") + " + " + frac("1", "2") + " = 1") + "."
      ],
      finalExplanation: m("sin 30°") + " and " + m("cos 60°") + " are equal because 30° and 60° are complementary angles.",
      verification: "With a calculator in <strong>DEGREE</strong> mode: " + m("sin(30) = 0.5") + " and " + m("cos(60) = 0.5") + ". ✓",
      commonMistake: "Using a calculator in radian mode — " + m("sin(30)") + " in radians is about −0.988.",
      misconceptions: [
        { answers: ["sqrt(3)"], feedback: "It looks like sin 60° and cos 30° (each √3⁄2) were used. Recheck which side is opposite 30°." }
      ],
      practiceProblemId: "tr-2"
    },
    {
      id: "tr-2",
      topic: "trig",
      title: "Exact Values (45° and 60°)",
      difficulty: "Intermediate",
      question: "Find the exact value of " + m("tan 45° + sin<sup>2</sup> 60°") + ".",
      prompt: "What does " + m("sin<sup>2</sup> 60°") + " mean — squaring the angle, or squaring the sine?",
      answerType: "number",
      answer: "7/4",
      acceptedAnswers: ["7/4"],
      inputHint: "a fraction like 5/4",
      hints: [
        m("tan 45°") + " comes from the 45°-45°-90° triangle (legs 1 and 1). " + m("sin 60°") + " comes from the 30°-60°-90° triangle.",
        m("tan 45° = " + frac("1", "1") + " = 1") + ", and " + m("sin 60° = " + frac(root("3"), "2")) + ".",
        m("sin<sup>2</sup> 60°") + " means " + m("(sin 60°)<sup>2</sup>") + ". Square the top and the bottom of " + m(frac(root("3"), "2")) + "."
      ],
      given: "The angles 45° and 60°.",
      find: "The exact value of " + m("tan 45° + sin<sup>2</sup> 60°") + ".",
      concept: "Special-triangle values, and the notation " + m("sin<sup>2</sup> θ = (sin θ)<sup>2</sup>") + ".",
      solutionSteps: [
        m("tan 45° = 1") + " (opposite and adjacent are equal).",
        m("sin 60° = " + frac(root("3"), "2")) + ", so " + m("sin<sup>2</sup> 60° = (" + frac(root("3"), "2") + ")<sup>2</sup> = " + frac("3", "4")) + ".",
        "Add: " + m("1 + " + frac("3", "4") + " = " + frac("7", "4")) + "."
      ],
      finalExplanation: "Squaring " + m(frac(root("3"), "2")) + " squares both the top and the bottom: " + m("(" + root("3") + ")² = 3") + " and " + m("2² = 4") + ".",
      verification: "Decimal check: " + m("1 + (0.8660)<sup>2</sup> ≈ 1 + 0.75 = 1.75 = " + frac("7", "4")) + ". ✓",
      commonMistake: "Forgetting to square the denominator, giving " + m(frac(root("3"), "4")) + " instead of " + m(frac("3", "4")) + ".",
      misconceptions: [
        { answers: ["1+sqrt(3)/4"], feedback: "When squaring √3⁄2, square the top AND the bottom: (√3)² = 3 and 2² = 4." },
        { answers: ["1+sqrt(3)/2"], feedback: "That uses sin 60° without squaring it. sin² 60° means (sin 60°)²." }
      ],
      practiceProblemId: "tr-1"
    },
    {
      id: "tr-3",
      topic: "trig",
      title: "Finding Cosine from a Triangle",
      difficulty: "Beginner",
      question:
        "In a right triangle, the side opposite angle " + m("θ") + " is 5 and the hypotenuse is 13. Find " + m("cos θ") + "." +
        // Inline SVG diagram of the triangle (no image file needed).
        '<svg class="figure" viewBox="0 0 240 150" role="img" aria-label="Right triangle: angle theta at the bottom left, opposite side 5, hypotenuse 13, adjacent side unknown">' +
        '<polygon points="30,125 200,125 200,30" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/>' +
        '<polyline points="186,125 186,111 200,111" fill="none" stroke="currentColor" stroke-width="1.5"/>' +
        '<path d="M58,125 A28,28 0 0 0 55,113" fill="none" stroke="currentColor" stroke-width="1.5"/>' +
        '<text x="64" y="119" font-size="14" font-style="italic" fill="currentColor">θ</text>' +
        '<text x="208" y="83" font-size="15" fill="currentColor">5</text>' +
        '<text x="98" y="68" font-size="15" fill="currentColor">13</text>' +
        '<text x="110" y="145" font-size="15" fill="currentColor">?</text>' +
        "</svg>",
      prompt: "Cosine uses which two sides of the triangle? Which one is missing?",
      answerType: "number",
      answer: "12/13",
      acceptedAnswers: ["12/13"],
      inputHint: "a fraction like 3/5",
      hints: [
        m("cos θ = " + frac("adjacent", "hypotenuse")) + ". You know the hypotenuse, but not the adjacent side yet.",
        "Use the Pythagorean theorem: " + m("adjacent<sup>2</sup> + 5<sup>2</sup> = 13<sup>2</sup>") + ".",
        m("adjacent<sup>2</sup> = 169 − 25 = 144") + ". What is the square root?"
      ],
      given: "Right triangle with opposite side 5 and hypotenuse 13.",
      find: m("cos θ") + ".",
      concept: "SOH-CAH-TOA (Cosine = Adjacent ÷ Hypotenuse) together with the Pythagorean theorem.",
      solutionSteps: [
        "Find the adjacent side: " + m("a<sup>2</sup> + 5<sup>2</sup> = 13<sup>2</sup>") + ", so " + m("a<sup>2</sup> = 169 − 25 = 144") + ".",
        "Take the square root: " + m("a = 12") + ".",
        "Apply CAH: " + m("cos θ = " + frac("12", "13")) + "."
      ],
      finalExplanation: "When a side is missing, the Pythagorean theorem usually comes first.",
      verification: m("sin<sup>2</sup> θ + cos<sup>2</sup> θ = " + frac("25", "169") + " + " + frac("144", "169") + " = 1") + ". ✓",
      commonMistake: "Answering " + m(frac("5", "13")) + " — that is " + m("sin θ") + " (opposite ÷ hypotenuse).",
      misconceptions: [
        { answers: ["5/13"], feedback: "That's sin θ (opposite ÷ hypotenuse). Cosine uses the ADJACENT side." },
        { answers: ["13/12"], feedback: "The fraction is upside down. Cosine = adjacent ÷ hypotenuse." },
        { answers: ["5/12"], feedback: "That's tan θ (opposite ÷ adjacent). Cosine = adjacent ÷ hypotenuse." }
      ],
      practiceProblemId: "tr-4"
    },
    {
      id: "tr-4",
      topic: "trig",
      title: "From Tangent to Sine",
      difficulty: "Intermediate",
      question: "Angle " + m("θ") + " is acute and " + m("tan θ = " + frac("3", "4")) + ". Find " + m("sin θ") + ".",
      prompt: "Could drawing a right triangle help? What would its sides be?",
      answerType: "number",
      answer: "3/5",
      acceptedAnswers: ["3/5"],
      inputHint: "a fraction like 2/7",
      hints: [
        "Draw a right triangle where " + m("tan θ = " + frac("opposite", "adjacent") + " = " + frac("3", "4")) + ": opposite 3, adjacent 4.",
        "Find the hypotenuse with the Pythagorean theorem: " + m("3<sup>2</sup> + 4<sup>2</sup> = h<sup>2</sup>") + ".",
        m("h<sup>2</sup> = 25") + ", so " + m("h = 5") + ". Now use " + m("sin θ = " + frac("opposite", "hypotenuse")) + "."
      ],
      given: m("tan θ = " + frac("3", "4")) + ", with " + m("θ") + " acute.",
      find: m("sin θ") + ".",
      concept: "Build a reference right triangle from one ratio, then read off the others.",
      solutionSteps: [
        "Since " + m("tan θ = " + frac("3", "4")) + ", use opposite = 3 and adjacent = 4.",
        "Hypotenuse: " + m("h = " + root("3² + 4²") + " = " + root("25") + " = 5") + ".",
        "So " + m("sin θ = " + frac("opposite", "hypotenuse") + " = " + frac("3", "5")) + " (positive because θ is acute)."
      ],
      finalExplanation: "One trig ratio is enough to rebuild the whole triangle (a 3-4-5 triangle here).",
      verification: m(frac("sin θ", "cos θ") + " = " + frac("3/5", "4/5") + " = " + frac("3", "4") + " = tan θ") + ". ✓",
      commonMistake: "Answering " + m(frac("4", "5")) + " — that's " + m("cos θ") + ".",
      misconceptions: [
        { answers: ["4/5"], feedback: "That's cos θ (adjacent ÷ hypotenuse). Sine uses the OPPOSITE side." },
        { answers: ["3/4"], feedback: "That's tan θ, which was given. Sine = opposite ÷ hypotenuse — you'll need the hypotenuse first." }
      ],
      practiceProblemId: "tr-3"
    },

    /* ======================== SEQUENCES & SERIES ======================= */
    {
      id: "sq-1",
      topic: "sequences",
      title: "nth Term of an Arithmetic Sequence",
      difficulty: "Beginner",
      question: "Find the 20th term of the arithmetic sequence " + m("3, 7, 11, 15, …") + ".",
      prompt: "What stays the same as you go from one term to the next?",
      answerType: "number",
      answer: "79",
      acceptedAnswers: ["79"],
      inputHint: "e.g. 42",
      hints: [
        "Find the common difference " + m("d") + " by subtracting consecutive terms.",
        m("d = 4") + ". The nth-term formula is " + m("a<sub>n</sub> = a<sub>1</sub> + (n − 1)d") + ".",
        "Substitute " + m("a<sub>1</sub> = 3") + ", " + m("n = 20") + ", " + m("d = 4") + ": " + m("a<sub>20</sub> = 3 + 19 · 4") + "."
      ],
      given: "The sequence " + m("3, 7, 11, 15, …") + ".",
      find: "The 20th term, " + m("a<sub>20</sub>") + ".",
      concept: "Arithmetic sequence formula: " + m("a<sub>n</sub> = a<sub>1</sub> + (n − 1)d") + ".",
      solutionSteps: [
        "Common difference: " + m("d = 7 − 3 = 4") + ".",
        "Set up the formula: " + m("a<sub>20</sub> = 3 + (20 − 1)(4)") + ".",
        "Compute: " + m("3 + 19(4) = 3 + 76 = 79") + "."
      ],
      finalExplanation: "To reach the 20th term from the 1st, you add the difference 19 times — not 20.",
      verification: "The pattern is " + m("a<sub>n</sub> = 4n − 1") + " (check: " + m("4(1) − 1 = 3") + "). Then " + m("4(20) − 1 = 79") + ". ✓",
      commonMistake: "Using " + m("n") + " instead of " + m("n − 1") + ": " + m("3 + 20 · 4 = 83") + ".",
      misconceptions: [
        { answers: ["83"], feedback: "Use (n − 1), not n. From term 1 to term 20 you only take 19 steps." },
        { answers: ["80"], feedback: "Don't forget the first term. The formula is a₁ + (n − 1)d." }
      ],
      practiceProblemId: "sq-2"
    },
    {
      id: "sq-2",
      topic: "sequences",
      title: "Sum of an Arithmetic Series",
      difficulty: "Intermediate",
      question: "Find the sum of the first 15 terms of the arithmetic sequence " + m("2, 5, 8, …") + ".",
      prompt: "Are you looking for one term, or a total of many terms?",
      answerType: "number",
      answer: "345",
      acceptedAnswers: ["345"],
      inputHint: "e.g. 210",
      hints: [
        "This sequence is arithmetic. Identify " + m("a<sub>1</sub>") + ", " + m("d") + ", and " + m("n") + ".",
        m("a<sub>1</sub> = 2") + ", " + m("d = 3") + ", " + m("n = 15") + ". Use " + m("S<sub>n</sub> = " + frac("n", "2") + "[2a<sub>1</sub> + (n − 1)d]") + ".",
        m("S<sub>15</sub> = " + frac("15", "2") + "[2(2) + 14(3)] = " + frac("15", "2") + "(46)") + "."
      ],
      given: "The sequence " + m("2, 5, 8, …") + " and " + m("n = 15") + ".",
      find: "The sum " + m("S<sub>15</sub>") + ".",
      concept: "Arithmetic series: " + m("S<sub>n</sub> = " + frac("n", "2") + "[2a<sub>1</sub> + (n − 1)d]") + ", or " + m(frac("n", "2") + "(a<sub>1</sub> + a<sub>n</sub>)") + ".",
      solutionSteps: [
        "Identify: " + m("a<sub>1</sub> = 2") + ", " + m("d = 3") + ", " + m("n = 15") + ".",
        "Substitute: " + m("S<sub>15</sub> = " + frac("15", "2") + "[2(2) + (15 − 1)(3)] = " + frac("15", "2") + "(4 + 42)") + ".",
        "Compute: " + m(frac("15", "2") + "(46) = 15(23) = 345") + "."
      ],
      finalExplanation: "The sum equals the number of terms times the average of the first and last terms.",
      verification: "Last term: " + m("a<sub>15</sub> = 2 + 14(3) = 44") + ". Then " + m(frac("15(2 + 44)", "2") + " = 345") + ". ✓",
      commonMistake: "Finding the 15th term (44) instead of the sum, or forgetting to divide by 2.",
      misconceptions: [
        { answers: ["44"], feedback: "44 is the 15th term. The question asks for the SUM of the first 15 terms." },
        { answers: ["690"], feedback: "Almost — don't forget the division by 2 in the sum formula." }
      ],
      practiceProblemId: "sq-1"
    },
    {
      id: "sq-3",
      topic: "sequences",
      title: "nth Term of a Geometric Sequence",
      difficulty: "Intermediate",
      question: "Find the 6th term of the geometric sequence " + m("2, 6, 18, …") + ".",
      prompt: "Is the sequence growing by adding or by multiplying?",
      answerType: "number",
      answer: "486",
      acceptedAnswers: ["486"],
      inputHint: "e.g. 128",
      hints: [
        "Find the common ratio " + m("r") + " by dividing a term by the one before it.",
        m("r = 3") + ". The geometric formula is " + m("a<sub>n</sub> = a<sub>1</sub> · r<sup>n − 1</sup>") + ".",
        m("a<sub>6</sub> = 2 · 3<sup>5</sup>") + ". Compute " + m("3<sup>5</sup>") + " first."
      ],
      given: "The sequence " + m("2, 6, 18, …") + ".",
      find: "The 6th term, " + m("a<sub>6</sub>") + ".",
      concept: "Geometric sequence formula: " + m("a<sub>n</sub> = a<sub>1</sub> · r<sup>n − 1</sup>") + ".",
      solutionSteps: [
        "Common ratio: " + m("r = " + frac("6", "2") + " = 3") + ".",
        "Set up: " + m("a<sub>6</sub> = 2 · 3<sup>6 − 1</sup> = 2 · 3<sup>5</sup>") + ".",
        "Compute: " + m("3<sup>5</sup> = 243") + ", so " + m("a<sub>6</sub> = 2 · 243 = 486") + "."
      ],
      finalExplanation: "Only the ratio gets the exponent — multiply by the first term afterwards.",
      verification: "List the terms: 2, 6, 18, 54, 162, <strong>486</strong>. ✓",
      commonMistake: "Computing " + m("(2 · 3)<sup>5</sup>") + " or using " + m("3<sup>6</sup>") + " instead of " + m("3<sup>5</sup>") + ".",
      misconceptions: [
        { answers: ["1458"], feedback: "Use the exponent n − 1 = 5, not 6." },
        { answers: ["7776"], feedback: "Only r is raised to the power: 2 · 3⁵, not (2 · 3)⁵." }
      ],
      practiceProblemId: "sq-4"
    },
    {
      id: "sq-4",
      topic: "sequences",
      title: "Infinite Geometric Series",
      difficulty: "Advanced",
      question: "Find the sum of the infinite geometric series " + m("12 + 6 + 3 + " + frac("3", "2") + " + …") + ".",
      prompt: "As you keep adding terms, do they get bigger or smaller? What might the total approach?",
      answerType: "number",
      answer: "24",
      acceptedAnswers: ["24"],
      inputHint: "e.g. 30",
      hints: [
        "Find the common ratio " + m("r") + ". If " + m("|r| < 1") + ", the infinite sum exists.",
        m("r = " + frac("6", "12") + " = " + frac("1", "2")) + ". Use " + m("S<sub>∞</sub> = " + frac("a<sub>1</sub>", "1 − r")) + ".",
        m("S<sub>∞</sub> = " + frac("12", "1 − 1/2") + " = " + frac("12", "1/2")) + ". Dividing by " + m(frac("1", "2")) + " is the same as multiplying by what?"
      ],
      given: "The series " + m("12 + 6 + 3 + " + frac("3", "2") + " + …") + ".",
      find: "The sum of infinitely many terms, " + m("S<sub>∞</sub>") + ".",
      concept: "Infinite geometric series: if " + m("|r| < 1") + ", then " + m("S<sub>∞</sub> = " + frac("a<sub>1</sub>", "1 − r")) + ".",
      solutionSteps: [
        "Ratio: " + m("r = " + frac("1", "2")) + ", and " + m("|r| < 1") + ", so the sum exists.",
        "Substitute: " + m("S<sub>∞</sub> = " + frac("12", "1 − 1/2") + " = " + frac("12", "1/2")) + ".",
        "Divide: " + m("12 ÷ " + frac("1", "2") + " = 12 × 2 = 24") + "."
      ],
      finalExplanation: "Infinitely many terms can still add up to a finite number when they shrink fast enough.",
      verification: "Partial sums: 12, 18, 21, 22.5, 23.25, … — they get closer and closer to 24. ✓",
      commonMistake: "Computing " + m("12 × " + frac("1", "2") + " = 6") + " at the last step. Dividing by " + m(frac("1", "2")) + " doubles the number.",
      misconceptions: [
        { answers: ["6"], feedback: "12 ÷ ½ is 12 × 2, not 12 × ½." }
      ],
      practiceProblemId: "sq-3"
    },

    /* ===================== PROBABILITY & STATISTICS ==================== */
    {
      id: "ps-1",
      topic: "probstat",
      title: "Probability with One Die",
      difficulty: "Beginner",
      question: "A fair six-sided die is rolled once. What is the probability of rolling a number <strong>greater than 4</strong>?",
      prompt: "How many outcomes are possible, and which ones count as “greater than 4”?",
      answerType: "number",
      answer: "1/3",
      acceptedAnswers: ["1/3"],
      inputHint: "a fraction like 1/2",
      hints: [
        "Probability = " + m(frac("number of favorable outcomes", "total number of outcomes")) + ".",
        "List the outcomes greater than 4. Careful: is 4 itself included?",
        "Only 5 and 6 are greater than 4, so there are 2 favorable outcomes out of 6."
      ],
      given: "One roll of a fair die: outcomes 1, 2, 3, 4, 5, 6 (equally likely).",
      find: "The probability " + m("P(greater than 4)") + ".",
      concept: "Classical probability: favorable outcomes ÷ total equally likely outcomes.",
      solutionSteps: [
        "Total outcomes: 6.",
        "Favorable outcomes (greater than 4): 5 and 6, so 2 outcomes.",
        m("P = " + frac("2", "6") + " = " + frac("1", "3")) + "."
      ],
      finalExplanation: "“Greater than” excludes the number itself; “at least” would include it.",
      verification: "Complement: " + m("P(4 or less) = " + frac("4", "6") + " = " + frac("2", "3")) + ", and " + m(frac("1", "3") + " + " + frac("2", "3") + " = 1") + ". ✓",
      commonMistake: "Including 4, which gives " + m(frac("3", "6") + " = " + frac("1", "2")) + ". That would be “at least 4.”",
      misconceptions: [
        { answers: ["1/2"], feedback: "Is 4 greater than 4? “Greater than 4” only includes 5 and 6." },
        { answers: ["2"], feedback: "2 is the number of favorable outcomes. Divide by the total number of outcomes to get the probability." }
      ],
      practiceProblemId: "ps-2"
    },
    {
      id: "ps-2",
      topic: "probstat",
      title: "Probability with Two Dice",
      difficulty: "Intermediate",
      question: "Two fair six-sided dice are rolled. What is the probability that the <strong>sum is 7</strong>?",
      prompt: "How many different results are possible when rolling two dice?",
      answerType: "number",
      answer: "1/6",
      acceptedAnswers: ["1/6"],
      inputHint: "a fraction like 1/9",
      hints: [
        "Each die has 6 faces. How many outcomes are there for the pair?",
        "There are " + m("6 × 6 = 36") + " equally likely outcomes. Now list the pairs that add up to 7.",
        "Start the list: (1, 6), (2, 5), (3, 4), … and remember that (4, 3) is different from (3, 4)."
      ],
      given: "Two fair dice; each ordered pair of faces is equally likely.",
      find: "The probability that the two numbers add to 7.",
      concept: "Counting outcomes in a sample space of ordered pairs.",
      solutionSteps: [
        "Total outcomes: " + m("6 × 6 = 36") + ".",
        "Pairs with sum 7: (1,6), (2,5), (3,4), (4,3), (5,2), (6,1) — that's 6 pairs.",
        m("P = " + frac("6", "36") + " = " + frac("1", "6")) + "."
      ],
      finalExplanation: "With two dice, order matters: (3, 4) and (4, 3) are different outcomes.",
      verification: "Every first-die value 1–6 has exactly one partner that makes 7, so there are 6 favorable pairs out of 36. ✓",
      commonMistake: "Counting (3, 4) and (4, 3) as one outcome (giving " + m(frac("3", "36")) + "), or treating the 11 possible sums as equally likely.",
      misconceptions: [
        { answers: ["1/12"], feedback: "(3, 4) and (4, 3) are different outcomes — think of the dice as red and blue. Count both orders." },
        { answers: ["1/11"], feedback: "The 11 possible sums are NOT equally likely. Count the 36 ordered pairs instead." }
      ],
      practiceProblemId: "ps-1"
    },
    {
      id: "ps-3",
      topic: "probstat",
      title: "Finding the Mean",
      difficulty: "Beginner",
      question: "Find the mean of the data set " + m("4, 8, 6, 12, 5") + ".",
      prompt: "What two quantities do you need in order to compute an average?",
      answerType: "number",
      answer: "7",
      acceptedAnswers: ["7"],
      inputHint: "e.g. 9",
      hints: [
        "The mean is the sum of the values divided by how many values there are.",
        "Add the five values: " + m("4 + 8 + 6 + 12 + 5") + ".",
        "The sum is 35. How many values are in the data set?"
      ],
      given: "The data " + m("4, 8, 6, 12, 5") + ".",
      find: "The mean (average).",
      concept: "Mean " + m("= " + frac("sum of values", "number of values")) + ".",
      solutionSteps: [
        "Add: " + m("4 + 8 + 6 + 12 + 5 = 35") + ".",
        "Count: there are 5 values.",
        "Divide: " + m(frac("35", "5") + " = 7") + "."
      ],
      finalExplanation: "The mean is the “balance point” of the data.",
      verification: "Distances from 7: −3, +1, −1, +5, −2. They add up to 0, which is true for the mean. ✓",
      commonMistake: "Giving the median (middle value after sorting: 4, 5, <strong>6</strong>, 8, 12) instead of the mean.",
      misconceptions: [
        { answers: ["6"], feedback: "6 is the median (the middle value after sorting). The mean is the sum divided by the count." },
        { answers: ["35"], feedback: "35 is the total. Divide by the number of values to get the mean." }
      ],
      practiceProblemId: "ps-4"
    },
    {
      id: "ps-4",
      topic: "probstat",
      title: "Expected Value",
      difficulty: "Intermediate",
      question:
        "A discrete random variable " + m("X") + " has this probability distribution. Find the expected value " + m("E(X)") + "." +
        '<table class="dist"><caption class="sr-only">Probability distribution of X</caption>' +
        '<tr><th scope="row">' + m("x") + "</th><td>0</td><td>1</td><td>2</td></tr>" +
        '<tr><th scope="row">' + m("P(x)") + "</th><td>0.2</td><td>0.5</td><td>0.3</td></tr></table>",
      prompt: "Should every value of " + m("X") + " count equally, or should some count more?",
      answerType: "number",
      answer: "1.1",
      acceptedAnswers: ["1.1"],
      inputHint: "e.g. 0.8",
      hints: [
        "The expected value (mean) of a discrete random variable is " + m("E(X) = Σ x · P(x)") + ".",
        "Multiply each value by its probability: " + m("0(0.2)") + ", " + m("1(0.5)") + ", " + m("2(0.3)") + ".",
        "The products are 0, 0.5, and 0.6. Add them."
      ],
      given: "Values 0, 1, 2 with probabilities 0.2, 0.5, 0.3.",
      find: m("E(X)") + ", the long-run average value of " + m("X") + ".",
      concept: "Expected value is a probability-weighted average: " + m("E(X) = Σ x · P(x)") + ".",
      solutionSteps: [
        "Check the distribution: " + m("0.2 + 0.5 + 0.3 = 1") + ". ✓",
        "Multiply: " + m("0(0.2) = 0") + ", " + m("1(0.5) = 0.5") + ", " + m("2(0.3) = 0.6") + ".",
        "Add: " + m("E(X) = 0 + 0.5 + 0.6 = 1.1") + "."
      ],
      finalExplanation: "Values with higher probability pull the expected value toward them.",
      verification: "1.1 lies between the smallest (0) and largest (2) values, slightly above 1 because 2 is more likely than 0. ✓",
      commonMistake: "Averaging the values " + m("(0 + 1 + 2) ÷ 3 = 1") + " without weighting them by their probabilities.",
      misconceptions: [
        { answers: ["1"], feedback: "That's the plain average of 0, 1, 2. Expected value weights each value by its probability." }
      ],
      practiceProblemId: "ps-3"
    }
  ];

  // Make the data available to app.js in the browser…
  var data = { topics: TOPICS, problems: PROBLEMS };
  if (typeof window !== "undefined") {
    window.MathMentorData = data;
  }
  // …and to tests/verify.js when run with Node.js.
  if (typeof module !== "undefined" && module.exports) {
    module.exports = data;
  }
})();
