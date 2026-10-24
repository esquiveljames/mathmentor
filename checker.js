/* =====================================================================
   checker.js  —  SAFE ANSWER CHECKING
   ---------------------------------------------------------------------
   Turns what a student typed (e.g. "x = 3/2", "1.5", "√3/2", "5π/6",
   "3, -3") into numbers and compares them with the accepted answers.

   WHAT IT CAN DO
     • Numbers, fractions, decimals, + − × ÷, powers (^), parentheses
     • √ / sqrt(...), π / pi, implied multiplication like 2π or 3√2
     • An optional "x =" or "y =" in front of the answer
     • Lists of values in any order for "set" problems ("3, -3")
     • Recognise a rounded decimal (e.g. 0.333 for 1/3) as "very close"

   WHAT IT DOES NOT DO (on purpose)
     • It never uses eval() — student text is never run as code.
     • It does NOT check whether two ALGEBRAIC expressions are equal
       (e.g. "2(x+1)" vs "2x+2"). Problems are chosen so the final
       answer is a number or a multiple-choice option.
   ===================================================================== */

(function () {
  "use strict";

  // A special error type for input we can't read. Its message is shown
  // directly to the student, so it must be friendly.
  function InputError(message) {
    this.message = message;
  }

  // -------------------------------------------------------------------
  // STEP 1: Clean up the raw text.
  // -------------------------------------------------------------------
  function normalize(raw) {
    return String(raw)
      .toLowerCase()
      .replace(/[−–—]/g, "-") // − – — (fancy minus signs) → -
      .replace(/[×·∙]/g, "*")                // × and · → *
      .replace(/÷/g, "/")                    // ÷ → /
      .replace(/π/g, "pi")                   // π → pi
      .replace(/√/g, "sqrt")                 // √ → sqrt
      .replace(/²/g, "^2")                   // superscript 2 → ^2
      .replace(/³/g, "^3")                   // superscript 3 → ^3
      .replace(/\s+/g, "");                  // remove all spaces
  }

  // Remove a leading label like "x=", "y=" or "a20=" so that
  // "x = 5" is read as "5". If there are several "=", keep the last part.
  function stripLabel(text) {
    var parts = text.split("=");
    return parts[parts.length - 1];
  }

  // -------------------------------------------------------------------
  // STEP 2: Break the text into tokens (numbers, symbols, words).
  // -------------------------------------------------------------------
  function tokenize(text) {
    var tokens = [];
    var i = 0;
    while (i < text.length) {
      var ch = text[i];

      // A number such as 12, 0.5 or .75
      if (/[0-9.]/.test(ch)) {
        var start = i;
        while (i < text.length && /[0-9.]/.test(text[i])) i++;
        var numText = text.slice(start, i);
        // Reject things like "1.2.3" or a lonely "."
        if (!/^(\d+\.?\d*|\.\d+)$/.test(numText)) {
          throw new InputError("“" + numText + "” doesn't look like a number.");
        }
        tokens.push({ type: "num", value: parseFloat(numText) });
        continue;
      }

      // The words we understand: pi and sqrt
      if (text.startsWith("pi", i)) {
        tokens.push({ type: "num", value: Math.PI });
        i += 2;
        continue;
      }
      if (text.startsWith("sqrt", i)) {
        tokens.push({ type: "sqrt" });
        i += 4;
        continue;
      }

      // Operators and parentheses
      if ("+-*/^()".indexOf(ch) !== -1) {
        tokens.push({ type: "op", value: ch });
        i++;
        continue;
      }

      // Anything else (a letter such as x, a % sign, etc.) is not supported
      throw new InputError(
        "I can only read numbers here (fractions, decimals, √ and π are okay). Try removing “" + ch + "”."
      );
    }
    return tokens;
  }

  // -------------------------------------------------------------------
  // STEP 3: A tiny "recursive-descent" calculator.
  //   expression := term   (('+' | '-') term)*
  //   term       := unary  (('*' | '/' | implied ×) unary)*
  //   unary      := ('+' | '-') unary  |  power
  //   power      := primary ('^' unary)?
  //   primary    := number | sqrt primary | '(' expression ')'
  // This respects the usual order of operations, so -2^2 = -4.
  // -------------------------------------------------------------------
  function evaluate(text) {
    var tokens = tokenize(text);
    var pos = 0; // index of the token we're looking at

    function peek() { return tokens[pos]; }
    function isOp(tok, symbol) { return tok && tok.type === "op" && tok.value === symbol; }

    function parseExpression() {
      var value = parseTerm();
      while (isOp(peek(), "+") || isOp(peek(), "-")) {
        var op = tokens[pos++].value;
        var right = parseTerm();
        value = op === "+" ? value + right : value - right;
      }
      return value;
    }

    function parseTerm() {
      var value = parseUnary();
      while (true) {
        var tok = peek();
        if (isOp(tok, "*")) {
          pos++;
          value = value * parseUnary();
        } else if (isOp(tok, "/")) {
          pos++;
          var divisor = parseUnary();
          if (divisor === 0) throw new InputError("That expression divides by zero, which is undefined.");
          value = value / divisor;
        } else if (tok && (tok.type === "num" || tok.type === "sqrt" || isOp(tok, "("))) {
          // Implied multiplication, e.g. 2pi, 3sqrt(2), 2(5)
          value = value * parseUnary();
        } else {
          break;
        }
      }
      return value;
    }

    function parseUnary() {
      if (isOp(peek(), "-")) { pos++; return -parseUnary(); }
      if (isOp(peek(), "+")) { pos++; return parseUnary(); }
      return parsePower();
    }

    function parsePower() {
      var base = parsePrimary();
      if (isOp(peek(), "^")) {
        pos++;
        var exponent = parseUnary(); // right side may be negative, e.g. 3^-2
        return Math.pow(base, exponent);
      }
      return base;
    }

    function parsePrimary() {
      var tok = peek();
      if (!tok) throw new InputError("Your answer seems to end too early.");
      if (tok.type === "num") { pos++; return tok.value; }
      if (tok.type === "sqrt") {
        pos++;
        var inside = parsePrimary(); // works for sqrt3 and sqrt(3)
        if (inside < 0) throw new InputError("The square root of a negative number isn't a real number.");
        return Math.sqrt(inside);
      }
      if (isOp(tok, "(")) {
        pos++;
        var value = parseExpression();
        if (!isOp(peek(), ")")) throw new InputError("A closing parenthesis “)” seems to be missing.");
        pos++;
        return value;
      }
      throw new InputError("I couldn't read your answer near “" + (tok.value || tok.type) + "”.");
    }

    if (tokens.length === 0) throw new InputError("Please type an answer first.");
    var result = parseExpression();
    if (pos !== tokens.length) throw new InputError("I couldn't read the whole answer. Check for extra symbols.");
    if (!isFinite(result)) throw new InputError("That value is undefined or too large to check.");
    return result;
  }

  // -------------------------------------------------------------------
  // STEP 4: Turn an answer into a list of numbers.
  //   "number" problems → exactly one value
  //   "set" problems    → one or more values separated by , ; "or" "and"
  // -------------------------------------------------------------------
  function parseValues(raw, answerType) {
    var text = normalize(raw);
    if (text === "") throw new InputError("Please type an answer first.");

    // Words that mean "nothing" are a valid (but wrong, here) set answer.
    if (/^(nosolution|none|nozeros?|∅|\{\})$/.test(text)) return [];

    // (Spaces are already removed, so "3 or -3" has become "3or-3".)
    var pieces = text.split(/,|;|or|and/).filter(function (p) { return p !== ""; });
    if (answerType === "number" && pieces.length > 1) {
      throw new InputError("This question needs just one value. Remove the extra commas.");
    }
    return pieces.map(function (piece) { return evaluate(stripLabel(piece)); });
  }

  // -------------------------------------------------------------------
  // STEP 5: Compare numbers.
  // -------------------------------------------------------------------
  // Equal (allowing for tiny floating-point rounding like 0.1 + 0.2).
  function sameNumber(a, b) {
    return Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(b));
  }

  // Compare two lists of numbers ignoring order.
  function sameSet(a, b) {
    if (a.length !== b.length) return false;
    var x = a.slice().sort(function (p, q) { return p - q; });
    var y = b.slice().sort(function (p, q) { return p - q; });
    for (var i = 0; i < x.length; i++) {
      if (!sameNumber(x[i], y[i])) return false;
    }
    return true;
  }

  // -------------------------------------------------------------------
  // MAIN FUNCTION used by app.js
  //   check(problem, studentInput) returns an object:
  //     { status: "correct" }
  //     { status: "close",     message }   rounded decimal of the right value
  //     { status: "incorrect", message? }  message = targeted misconception
  //     { status: "invalid",   message }   we couldn't read the input
  // -------------------------------------------------------------------
  function check(problem, input) {
    // ---- Multiple choice: compare the chosen option id ----
    if (problem.answerType === "choice") {
      if (!input) return { status: "invalid", message: "Please choose one of the options first." };
      if (problem.acceptedAnswers.indexOf(input) !== -1) return { status: "correct" };
      var chosen = (problem.choices || []).filter(function (c) { return c.id === input; })[0];
      return { status: "incorrect", message: chosen && chosen.feedback ? chosen.feedback : "" };
    }

    // ---- Numeric answers: read the student's values ----
    var values;
    try {
      values = parseValues(input, problem.answerType);
    } catch (err) {
      if (err instanceof InputError) return { status: "invalid", message: err.message };
      throw err; // a real bug — let it show up in the console
    }

    // Is it one of the accepted answers?
    for (var i = 0; i < problem.acceptedAnswers.length; i++) {
      var accepted = parseValues(problem.acceptedAnswers[i], problem.answerType);
      if (sameSet(values, accepted)) return { status: "correct" };
    }

    // Is it a known mistake with targeted feedback?
    var list = problem.misconceptions || [];
    for (var j = 0; j < list.length; j++) {
      for (var k = 0; k < list[j].answers.length; k++) {
        if (sameSet(values, parseValues(list[j].answers[k], "set"))) {
          return { status: "incorrect", message: list[j].feedback };
        }
      }
    }

    // Is it a rounded decimal of the right answer? (Only if a "." was typed.)
    if (values.length === 1 && String(input).indexOf(".") !== -1) {
      var target = parseValues(problem.acceptedAnswers[0], problem.answerType);
      if (target.length === 1) {
        var diff = Math.abs(values[0] - target[0]);
        if (diff <= 0.005 * Math.max(1, Math.abs(target[0]))) {
          return {
            status: "close",
            message: "Very close! That looks like a rounded decimal. Can you give the exact value — as a fraction, or using √ or π?"
          };
        }
      }
    }

    return { status: "incorrect", message: "" };
  }

  // Export for the browser (window.MathChecker) and for Node tests.
  var api = { check: check, evaluate: evaluate, parseValues: parseValues };
  if (typeof window !== "undefined") window.MathChecker = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})();
