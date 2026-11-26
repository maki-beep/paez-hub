export default function ForgotPasswordStep1VerifyAccount() {
  const {adminMode} = React.useContext(State);
  return (
    <div className="screen-264-2136-forgot-password-step-1-verify-account" data-node-id="264:2136" data-name="Forgot password · Step 1 · Verify account">
      <p className="screen-264-2136-p" data-node-id="264:2137">
        STEP 1 OF 2
      </p>
      <p className="screen-264-2136-p-2" data-node-id="264:2138">
        Verify your account
      </p>
      <p className="screen-264-2136-p-3" data-node-id="264:2139">
        Use your registered school email and answer your saved security questions.
      </p>
      <div className="screen-264-2136-school-email" data-node-id="264:2140" data-name="School email">
        <p className="screen-264-2136-p-4" data-node-id="264:2141">
          School email
        </p>
        <div className="screen-264-2136-sample-input" data-node-id="264:2142" data-name="Sample input">
          <p className="screen-264-2136-p-3" data-node-id="264:2143">
            {adminMode ? "admin@example.edu" : "student@example.edu"}
          </p>
        </div>
      </div>
      <div className="screen-264-2136-example-security-question-what-was-your-childhood-nickname" data-node-id="264:2144" data-name="Example security question · What was your childhood nickname?">
        <p className="screen-264-2136-p-4" data-node-id="264:2145">
          Example security question · What was your childhood nickname?
        </p>
        <div className="screen-264-2136-sample-input" data-node-id="264:2146" data-name="Sample input">
          <p className="screen-264-2136-p-3" data-node-id="264:2147">
            ••••••••
          </p>
        </div>
      </div>
      <div className="screen-264-2136-example-security-question-what-was-the-name-of-your-first-sc" data-node-id="264:2148" data-name="Example security question · What was the name of your first school?">
        <p className="screen-264-2136-p-4" data-node-id="264:2149">
          Example security question · What was the name of your first school?
        </p>
        <div className="screen-264-2136-sample-input" data-node-id="264:2150" data-name="Sample input">
          <p className="screen-264-2136-p-3" data-node-id="264:2151">
            ••••••••
          </p>
        </div>
      </div>
      <div className="screen-264-2136-example-security-question-what-is-a-place-you-remember-visit" data-node-id="264:2152" data-name="Example security question · What is a place you remember visiting?">
        <p className="screen-264-2136-p-4" data-node-id="264:2153">
          Example security question · What is a place you remember visiting?
        </p>
        <div className="screen-264-2136-sample-input" data-node-id="264:2154" data-name="Sample input">
          <p className="screen-264-2136-p-3" data-node-id="264:2155">
            ••••••••
          </p>
        </div>
      </div>
      <button className="screen-264-2136-verify-and-continue" data-node-id="264:2156" data-name="Verify and continue">
        <p className="screen-264-2136-p-5" data-node-id="264:2157">
          Verify and continue
        </p>
      </button>
      <button className="screen-264-2136-back-to-sign-in" data-node-id="264:2158" data-name="Back to sign-in">
        <p className="screen-264-2136-p-6" data-node-id="264:2159">
          Back to sign-in
        </p>
      </button>
    </div>
  );
}
