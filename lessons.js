/* =====================================================================
   lessons.js  —  AUDIO LESSONS ("classroom mode")
   ---------------------------------------------------------------------
   Each topic can have one prerecorded audio lesson. The lesson is split
   into SEGMENTS (sections). While the audio plays, the chalkboard shows
   the current segment's board, and the transcript highlights it.

   LESSON FIELDS
     topic      The topic id from problems.js (e.g. "functions").
     title      Lesson title shown on screen.
     audio      Relative path to the MP3 file (e.g. "lesson-functions.mp3"). Keep it in the SAME folder as index.html.
     narrator   Who is speaking — shown to students (be honest!).
     duration   Length of the audio in seconds (used before the file loads).
     starts     The time (in seconds) where each segment BEGINS in the
                audio. One number per segment, in order, starting at 0.
                → Recording your own voice? Use the Timing Helper on the
                  lesson page to get these numbers, then paste them here.
     segments   [{ title, board, script }]
                  title   Section heading on the chalkboard.
                  board   Lines written on the chalkboard (HTML allowed).
                  script  EXACTLY what the narrator says. This is also the
                          transcript students can read, and the script
                          you read aloud if you record your own voice.
                          Write math in words ("x squared", "one half")
                          so it reads naturally and sounds right.

   tools/make_audio.py can regenerate the MP3s and the `duration` and
   `starts` numbers automatically from the scripts below.
   ===================================================================== */

(function () {
  "use strict";

  // ---- Small math-formatting helpers (same idea as in problems.js) ----
  function plain(html) { return String(html).replace(/<[^>]*>/g, ""); }
  function frac(n, d) {
    return '<span class="frac" role="img" aria-label="' + plain(n) + " over " + plain(d) + '">' +
      '<span class="num" aria-hidden="true">' + n + '</span><span class="den" aria-hidden="true">' + d + "</span></span>";
  }
  function root(x) {
    return '<span class="sqrt" role="img" aria-label="square root of ' + plain(x) + '"><span aria-hidden="true">√</span><span class="radicand" aria-hidden="true">' + x + "</span></span>";
  }
  function m(html) { return '<span class="math">' + html + "</span>"; }

  // Who is speaking in the bundled audio files.
  var NARRATOR = "Synthetic voice (Piper text-to-speech)";

  var LESSONS = [
    /* =========================== FUNCTIONS =========================== */
    {
      topic: "functions",
      title: "Functions: Inputs, Outputs, and Reversing Them",
      audio: "lesson-functions.mp3",
      narrator: NARRATOR,
      duration: 143.14,
      starts: [0.5, 24.29, 58.02, 86.83, 123.41],
      segments: [
        {
          title: "What is a function?",
          board: [
            "input  →  <strong>rule</strong>  →  output",
            m("f(x) = 3x + 2"),
            m("f(4) = 3(4) + 2 = 14"),
            "Each input gives <strong>exactly one</strong> output."
          ],
          script:
            "Good day, class! Today we're talking about functions. A function is a rule that takes an input and gives exactly one output. " +
            "We usually write it as f of x. For example, if f of x equals three x plus two, then f of four means: put four in place of x. " +
            "Three times four is twelve, plus two is fourteen. So f of four equals fourteen."
        },
        {
          title: "Evaluating with negative inputs",
          board: [
            m("g(x) = x² − 4x + 3"),
            m("g(−1) = (−1)² − 4(−1) + 3"),
            m("= 1 + 4 + 3 = 8"),
            "Tip: always wrap the input in <strong>parentheses</strong>."
          ],
          script:
            "Now let's try something trickier. Let g of x equal x squared, minus four x, plus three. Find g of negative one. " +
            "Here is my tip: every time you substitute, wrap the input in parentheses. Negative one, in parentheses, squared, is positive one. " +
            "Minus four times negative one is plus four. Then add three. One plus four plus three gives eight. " +
            "Without parentheses, many students write negative one squared as negative one, and the whole answer goes wrong."
        },
        {
          title: "Composite functions",
          board: [
            m("f(x) = 2x + 1,  g(x) = x²"),
            m("(f ∘ g)(3) = f(g(3))"),
            m("g(3) = 9  →  f(9) = 2(9) + 1 = 19"),
            "Work from the <strong>inside out</strong>."
          ],
          script:
            "Next, composition. When you see f circle g of three, read it as f of g of three. " +
            "Let f of x equal two x plus one, and g of x equal x squared. We work from the inside out. " +
            "First, g of three is three squared, which is nine. Then we feed nine into f. Two times nine plus one is nineteen. " +
            "So f of g of three equals nineteen. Remember, the inside function always goes first."
        },
        {
          title: "Inverse functions",
          board: [
            m("h(x) = 4x − 5.   Find  h<sup>−1</sup>(7)."),
            "Ask: which input gives an output of 7?",
            m("4x − 5 = 7  →  4x = 12  →  x = 3"),
            "Check: " + m("h(3) = 4(3) − 5 = 7") + " ✓",
            m("h<sup>−1</sup>(7)") + " is <strong>not</strong> " + m(frac("1", "h(7)"))
          ],
          script:
            "Finally, inverse functions. An inverse undoes what the function does. Let h of x equal four x minus five. " +
            "What is h inverse of seven? The question really asks: which input gives an output of seven? " +
            "So we solve four x minus five equals seven. Add five to get four x equals twelve, then divide by four. x equals three. " +
            "Let's check: h of three is twelve minus five, which is seven. It works! " +
            "And be careful: the small negative one in h inverse is not an exponent. It does not mean one over h of seven."
        },
        {
          title: "Recap",
          board: [
            "1. <strong>Evaluate:</strong> substitute with parentheses",
            "2. <strong>Compose:</strong> inside out",
            "3. <strong>Inverse:</strong> which input gives this output?"
          ],
          script:
            "Let's recap. To evaluate, substitute using parentheses. To compose, work from the inside out. " +
            "And for an inverse, ask which input produces the given output, then check your answer in the original function. " +
            "Now it's your turn. Go to the practice problems, and remember: I'm here with hints if you get stuck."
        }
      ]
    },

    /* ======================= RATIONAL FUNCTIONS ====================== */
    {
      topic: "rational",
      title: "Rational Functions: Equations, Asymptotes, and Holes",
      audio: "lesson-rational.mp3",
      narrator: NARRATOR,
      duration: 153.75,
      starts: [0.5, 17.26, 55.14, 74.44, 109.3, 137.46],
      segments: [
        {
          title: "What is a rational function?",
          board: [
            m("f(x) = " + frac("P(x)", "Q(x)")) + "  (a polynomial over a polynomial)",
            "The denominator can <strong>never</strong> be zero:  " + m("Q(x) ≠ 0")
          ],
          script:
            "Good day, class! A rational function is a fraction where the top and the bottom are both polynomials. " +
            "There is one golden rule: the denominator can never be zero. So before we do anything else, " +
            "we always find the values of x that are not allowed."
        },
        {
          title: "Solving a rational equation",
          board: [
            m(frac("2", "x − 1") + " = " + frac("4", "x + 3")),
            "Restrictions: " + m("x ≠ 1,  x ≠ −3"),
            m("2(x + 3) = 4(x − 1)"),
            m("2x + 6 = 4x − 4  →  10 = 2x  →  x = 5"),
            "Check: " + m(frac("2", "4") + " = " + frac("4", "8")) + " ✓"
          ],
          script:
            "Let's solve two over x minus one equals four over x plus three. First, the restrictions: x cannot be one, and x cannot be negative three. " +
            "Now cross-multiply. Two times the quantity x plus three equals four times the quantity x minus one. " +
            "Distribute carefully: two x plus six equals four x minus four. Move the terms: ten equals two x, so x equals five. " +
            "Five is not a restricted value, so we keep it. Check: two over four is one half, and four over eight is also one half. It works."
        },
        {
          title: "Watch out: extraneous solutions",
          board: [
            "After solving, compare with the restrictions.",
            "If your answer is a <strong>restricted</strong> value → reject it.",
            "If nothing is left → <strong>no solution</strong>."
          ],
          script:
            "Here's a trap. When we multiply both sides by an expression with x in it, the algebra can produce a fake answer, called an extraneous solution. " +
            "That happens when your answer is one of the restricted values. If that happens, reject it. " +
            "And if no answers survive, the equation has no solution."
        },
        {
          title: "Asymptotes",
          board: [
            m("f(x) = " + frac("4x + 1", "2x − 6")),
            "Vertical: " + m("2x − 6 = 0  →  x = 3"),
            "Horizontal (equal degrees): " + m("y = " + frac("4", "2") + " = 2"),
            "Top degree smaller → " + m("y = 0")
          ],
          script:
            "Now let's read a graph without drawing it. Take f of x equals four x plus one, over two x minus six. " +
            "A vertical asymptote appears where the denominator is zero. Two x minus six equals zero when x equals three. " +
            "For the horizontal asymptote, compare the highest powers. Here both are degree one, so we divide the leading coefficients: four over two, which is two. " +
            "So the horizontal asymptote is y equals two. If the top had a smaller degree, the horizontal asymptote would be y equals zero."
        },
        {
          title: "Zeros versus holes",
          board: [
            m("f(x) = " + frac("x² − 4", "x − 2") + " = " + frac("(x − 2)(x + 2)", "x − 2")),
            m("x = 2") + " → denominator is 0 → <strong>hole</strong> at " + m("(2, 4)"),
            "Zero: " + m("x = −2")
          ],
          script:
            "One last idea: zeros and holes. Consider x squared minus four, over x minus two. Factor the top: x minus two, times x plus two. " +
            "The top is zero at x equals two and at x equals negative two. But x equals two also makes the bottom zero, so it can't be a zero of the function. " +
            "Instead, the graph has a hole there, at the point two, four. The only zero is x equals negative two."
        },
        {
          title: "Recap",
          board: [
            "1. Find restrictions first",
            "2. Clear fractions, solve, then <strong>check</strong>",
            "3. Asymptotes: denominator zero; compare degrees",
            "4. A value that zeroes the denominator is never a zero"
          ],
          script:
            "To recap: find the restrictions first, clear the fractions, solve, and always check your answers. " +
            "For asymptotes, look at where the denominator is zero, and compare degrees. " +
            "Now head to the practice problems and put these ideas to work."
        }
      ]
    },

    /* =================== EXPONENTIAL & LOGARITHMIC =================== */
    {
      topic: "explog",
      title: "Exponents and Logarithms: Two Sides of One Idea",
      audio: "lesson-explog.mp3",
      narrator: NARRATOR,
      duration: 116.69,
      starts: [0.5, 21.85, 37.58, 55.81, 76.64, 101.64],
      segments: [
        {
          title: "Exponential functions",
          board: [
            m("f(x) = b<sup>x</sup>,   b > 0,  b ≠ 1"),
            m("2<sup>0</sup> = 1,   2<sup>3</sup> = 8,   2<sup>−1</sup> = " + frac("1", "2")),
            "Negative exponent → reciprocal"
          ],
          script:
            "Good day, class! An exponential function looks like b to the power x, where the base b is positive and not equal to one. " +
            "With base two: two to the zero is one, two cubed is eight, and two to the negative one is one half. " +
            "Notice that a negative exponent gives a reciprocal, not a negative number."
        },
        {
          title: "Same base → equal exponents",
          board: [
            m("3<sup>x − 2</sup> = 81"),
            m("81 = 3<sup>4</sup>   →   3<sup>x − 2</sup> = 3<sup>4</sup>"),
            m("x − 2 = 4   →   x = 6")
          ],
          script:
            "To solve three to the power x minus two equals eighty-one, write both sides with the same base. " +
            "Eighty-one is three to the fourth. Once the bases match, the exponents must match. " +
            "So x minus two equals four, and x equals six."
        },
        {
          title: "Find a common base",
          board: [
            m("4<sup>x</sup> = 8"),
            m("(2<sup>2</sup>)<sup>x</sup> = 2<sup>3</sup>   →   2<sup>2x</sup> = 2<sup>3</sup>"),
            m("2x = 3   →   x = " + frac("3", "2"))
          ],
          script:
            "Sometimes the bases don't match at first. Try four to the x equals eight. " +
            "Both four and eight are powers of two. Four is two squared, and eight is two cubed. " +
            "So two to the two x equals two cubed. That means two x equals three, and x equals three halves."
        },
        {
          title: "What a logarithm means",
          board: [
            m("log<sub>b</sub> a = c   ⇔   b<sup>c</sup> = a"),
            m("log<sub>5</sub> 25 = 2") + "  because " + m("5<sup>2</sup> = 25"),
            m("log<sub>2</sub> " + frac("1", "8") + " = −3") + "  because " + m("2<sup>−3</sup> = " + frac("1", "8"))
          ],
          script:
            "Now, logarithms. A logarithm is just an exponent. Log base b of a asks: b to what power gives a? " +
            "Log base five of twenty-five is two, because five squared is twenty-five. " +
            "And log base two of one eighth is negative three, because two to the negative three is one eighth."
        },
        {
          title: "Solving a log equation",
          board: [
            m("log<sub>2</sub>(x + 3) = 5"),
            m("2<sup>5</sup> = x + 3   →   32 = x + 3"),
            m("x = 29"),
            "Check: argument " + m("29 + 3 = 32 > 0") + " ✓"
          ],
          script:
            "To solve log base two of x plus three equals five, rewrite it in exponential form. " +
            "The base, two, raised to the answer, five, equals what's inside the log. Two to the fifth is thirty-two, so thirty-two equals x plus three, and x equals twenty-nine. " +
            "Always check that what's inside the log is positive. Thirty-two is positive, so our answer is valid."
        },
        {
          title: "Recap",
          board: [
            "Match bases → set exponents equal",
            "A log <strong>is</strong> an exponent",
            m("log<sub>b</sub> A = c   ⇔   b<sup>c</sup> = A")
          ],
          script:
            "To recap: for exponential equations, match the bases, then set the exponents equal. " +
            "For logarithms, remember that a log is an exponent, and switch to exponential form to solve. " +
            "You're ready for the practice problems. Good luck!"
        }
      ]
    },

    /* ======================== BASIC TRIGONOMETRY ===================== */
    {
      topic: "trig",
      title: "Trigonometry: SOH-CAH-TOA and Special Triangles",
      audio: "lesson-trig.mp3",
      narrator: NARRATOR,
      duration: 128.29,
      starts: [0.5, 28.25, 60.02, 91.79, 114.49],
      segments: [
        {
          title: "SOH-CAH-TOA",
          board: [
            m("sin θ = " + frac("opposite", "hypotenuse")),
            m("cos θ = " + frac("adjacent", "hypotenuse")),
            m("tan θ = " + frac("opposite", "adjacent"))
          ],
          script:
            "Good day, class! In a right triangle, we name the sides from the point of view of an angle, called theta. " +
            "The hypotenuse is the longest side, across from the right angle. The opposite side is across from theta, and the adjacent side is next to it. " +
            "Remember SOH, CAH, TOA. Sine is opposite over hypotenuse. Cosine is adjacent over hypotenuse. Tangent is opposite over adjacent."
        },
        {
          title: "Finding a missing side first",
          board: [
            "Opposite = 8, hypotenuse = 17",
            m("adj² = 17² − 8² = 289 − 64 = 225  →  adj = 15"),
            m("sin θ = " + frac("8", "17") + ",  cos θ = " + frac("15", "17") + ",  tan θ = " + frac("8", "15"))
          ],
          script:
            "Suppose the side opposite theta is eight, and the hypotenuse is seventeen. We are missing the adjacent side, so we use the Pythagorean theorem. " +
            "Seventeen squared minus eight squared is two hundred eighty-nine minus sixty-four, which is two hundred twenty-five. The square root is fifteen. " +
            "Now we can write all three ratios: sine is eight over seventeen, cosine is fifteen over seventeen, and tangent is eight over fifteen."
        },
        {
          title: "The special right triangles",
          board: [
            "45°-45°-90°: sides  1 : 1 : " + root("2") + "   →   " + m("sin 45° = " + frac(root("2"), "2")),
            "30°-60°-90°: sides  1 : " + root("3") + " : 2",
            m("sin 30° = " + frac("1", "2") + ",  cos 30° = " + frac(root("3"), "2") + ",  tan 60° = " + root("3"))
          ],
          script:
            "Two triangles appear again and again. The forty-five, forty-five, ninety triangle has sides one, one, and square root of two. So sine of forty-five degrees is square root of two over two. " +
            "The thirty, sixty, ninety triangle has sides one, square root of three, and two. The short side, one, is opposite the thirty degree angle. " +
            "So sine of thirty is one half, cosine of thirty is square root of three over two, and tangent of sixty is square root of three."
        },
        {
          title: "Reading sin² θ",
          board: [
            m("sin² θ = (sin θ)²"),
            m("sin² 30° + cos² 30° = " + frac("1", "4") + " + " + frac("3", "4") + " = 1"),
            "In fact, " + m("sin² θ + cos² θ = 1") + " for every angle."
          ],
          script:
            "A quick note on notation. Sine squared theta means: find the sine first, then square it. " +
            "For thirty degrees: one half squared is one fourth, and square root of three over two, squared, is three fourths. Together they make one. " +
            "That's no accident. Sine squared plus cosine squared always equals one."
        },
        {
          title: "Recap",
          board: [
            "SOH-CAH-TOA",
            "Missing side? Pythagorean theorem first",
            "Memorize the two special triangles",
            "Calculator in <strong>DEGREE</strong> mode"
          ],
          script:
            "To recap: use SOH, CAH, TOA. If a side is missing, use the Pythagorean theorem first. Learn the two special triangles by heart. " +
            "And if you use a calculator, make sure it's in degree mode. Now, let's practice!"
        }
      ]
    },

    /* ======================= SEQUENCES & SERIES ====================== */
    {
      topic: "sequences",
      title: "Sequences and Series: Adding Patterns and Multiplying Patterns",
      audio: "lesson-sequences.mp3",
      narrator: NARRATOR,
      duration: 124.2,
      starts: [0.5, 30.5, 57.44, 83.32, 107.55],
      segments: [
        {
          title: "Arithmetic sequences",
          board: [
            m("5, 9, 13, 17, …     d = 4"),
            m("a<sub>n</sub> = a<sub>1</sub> + (n − 1)d"),
            m("a<sub>10</sub> = 5 + 9(4) = 41")
          ],
          script:
            "Good day, class! An arithmetic sequence adds the same number each time. That number is called the common difference, d. " +
            "In five, nine, thirteen, seventeen, the common difference is four. To find any term, use: a sub n equals a sub one plus n minus one times d. " +
            "For the tenth term, that's five plus nine times four, which is forty-one. We multiply by nine, not ten, because from the first term to the tenth there are only nine steps."
        },
        {
          title: "Adding an arithmetic series",
          board: [
            m("S<sub>n</sub> = " + frac("n", "2") + "(a<sub>1</sub> + a<sub>n</sub>)"),
            m("1 + 2 + … + 100 = " + frac("100", "2") + "(1 + 100) = 5050"),
            m("5 + 9 + … + 41:  S<sub>10</sub> = " + frac("10", "2") + "(5 + 41) = 230")
          ],
          script:
            "To add up the terms, use: S sub n equals n over two, times the first term plus the last term. " +
            "There's a famous story that a young student added one to one hundred this way: one hundred over two, times one hundred one, gives five thousand fifty. " +
            "For our sequence, the first ten terms add up to ten over two, times five plus forty-one. That's five times forty-six, or two hundred thirty."
        },
        {
          title: "Geometric sequences",
          board: [
            m("3, 6, 12, 24, …     r = 2"),
            m("a<sub>n</sub> = a<sub>1</sub> · r<sup>n − 1</sup>"),
            m("a<sub>7</sub> = 3 · 2<sup>6</sup> = 3 · 64 = 192")
          ],
          script:
            "A geometric sequence multiplies by the same number each time. That number is the common ratio, r. " +
            "In three, six, twelve, twenty-four, the ratio is two. The formula is a sub n equals a sub one times r to the power n minus one. " +
            "The seventh term is three times two to the sixth, which is three times sixty-four, or one hundred ninety-two."
        },
        {
          title: "Infinite geometric series",
          board: [
            m("9 + 3 + 1 + " + frac("1", "3") + " + …     r = " + frac("1", "3")),
            "If " + m("|r| < 1") + ":   " + m("S<sub>∞</sub> = " + frac("a<sub>1</sub>", "1 − r")),
            m("S<sub>∞</sub> = " + frac("9", "2/3") + " = " + frac("27", "2") + " = 13.5")
          ],
          script:
            "Here's something amazing. If the ratio is between negative one and one, you can add infinitely many terms and still get a finite answer. " +
            "Take nine, plus three, plus one, plus one third, and so on. The ratio is one third. " +
            "The sum is the first term over one minus r: nine divided by two thirds, which is twenty-seven halves, or thirteen and a half."
        },
        {
          title: "Recap",
          board: [
            "Adding the same number → <strong>arithmetic</strong> (d)",
            "Multiplying by the same number → <strong>geometric</strong> (r)",
            "Infinite sum only when " + m("|r| < 1")
          ],
          script:
            "To recap: if the pattern adds, it's arithmetic. If it multiplies, it's geometric. " +
            "Use n minus one in the term formulas, and only add an infinite series when the ratio is less than one in size. On to the practice problems!"
        }
      ]
    },

    /* ==================== PROBABILITY & STATISTICS =================== */
    {
      topic: "probstat",
      title: "Probability and Statistics: Chances and Averages",
      audio: "lesson-probstat.mp3",
      narrator: NARRATOR,
      duration: 121.28,
      starts: [0.5, 18.99, 33.09, 57.49, 79.2, 107.3],
      segments: [
        {
          title: "Probability basics",
          board: [
            m("P(E) = " + frac("favorable outcomes", "total outcomes")),
            "Bag: 3 red, 5 blue  →  " + m("P(red) = " + frac("3", "8")),
            m("0 ≤ P(E) ≤ 1")
          ],
          script:
            "Good day, class! The probability of an event is the number of favorable outcomes divided by the total number of equally likely outcomes. " +
            "If a bag has three red marbles and five blue marbles, the probability of picking red is three out of eight. " +
            "A probability is always between zero and one."
        },
        {
          title: "The complement",
          board: [
            m("P(not E) = 1 − P(E)"),
            m("P(not red) = 1 − " + frac("3", "8") + " = " + frac("5", "8"))
          ],
          script:
            "The chance that something does not happen is one minus the chance that it does. " +
            "So the probability of not picking red is one minus three eighths, which is five eighths. That matches the five blue marbles."
        },
        {
          title: "Listing a sample space",
          board: [
            "Two coins:  HH,  HT,  TH,  TT",
            m("P(exactly one head) = " + frac("2", "4") + " = " + frac("1", "2")),
            "HT and TH are <strong>different</strong> outcomes"
          ],
          script:
            "When there's more than one coin or die, list every outcome. Two coins give four outcomes: heads heads, heads tails, tails heads, and tails tails. " +
            "Exactly one head happens in two of them, so the probability is two fourths, or one half. " +
            "Notice that heads tails and tails heads are different outcomes. Think of one coin as a peso and the other as a five-peso coin."
        },
        {
          title: "Mean and median",
          board: [
            "Data: 2, 9, 4, 7, 3",
            "Mean: " + m(frac("2 + 9 + 4 + 7 + 3", "5") + " = " + frac("25", "5") + " = 5"),
            "Median (sorted 2, 3, <strong>4</strong>, 7, 9): " + m("4")
          ],
          script:
            "Now, statistics. The mean is the sum of the values divided by how many there are. For two, nine, four, seven, and three, the sum is twenty-five, and there are five values, so the mean is five. " +
            "Don't confuse it with the median, which is the middle value after sorting. Sorted, the data are two, three, four, seven, nine, so the median is four."
        },
        {
          title: "Expected value",
          board: [
            "Prize " + m("x") + ":  0, 10, 50   with   " + m("P(x)") + ":  0.70, 0.25, 0.05",
            m("E(X) = Σ x · P(x)"),
            m("= 0(0.70) + 10(0.25) + 50(0.05) = 0 + 2.5 + 2.5 = 5")
          ],
          script:
            "Finally, expected value. It's an average where each value is weighted by its probability. " +
            "Suppose a game pays zero pesos with probability zero point seven, ten pesos with probability zero point two five, and fifty pesos with probability zero point zero five. " +
            "Multiply and add: zero, plus two point five, plus two point five. The expected value is five pesos per game, in the long run."
        },
        {
          title: "Recap",
          board: [
            "Probability = favorable ÷ total",
            "Complement: " + m("1 − P(E)"),
            "Mean ≠ median",
            "Expected value = probability-weighted average"
          ],
          script:
            "To recap: probability is favorable over total, the complement is one minus the probability, the mean and median are different measures, " +
            "and expected value weights each outcome by its probability. Let's practice!"
        }
      ]
    }
  ];

  // Credit shown on the lesson page (required by the voice's CC BY 4.0 license).
  var AUDIO_CREDIT =
    "Narration generated offline with Piper text-to-speech using the en-US LibriTTS voice " +
    "(trained on the LibriTTS dataset, CC BY 4.0, openslr.org/60).";

  var data = { lessons: LESSONS, credit: AUDIO_CREDIT };
  if (typeof window !== "undefined") window.MathMentorLessons = data;
  if (typeof module !== "undefined" && module.exports) module.exports = data;
})();
