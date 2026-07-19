/** Redirect guests to sign-in, preserving where they wanted to go. */
export const redirectToSignIn = (navigate, returnPath) => {
  navigate('/signin', { state: { from: returnPath } });
};

/** Redirect guests to sign-up, preserving where they wanted to go. */
export const redirectToSignUp = (navigate, returnPath) => {
  navigate('/signup', { state: { from: returnPath } });
};

/** Navigate to target if authenticated; otherwise send to sign-in. */
export const goWithAuth = (navigate, isAuthenticated, targetPath, returnPath = targetPath) => {
  if (isAuthenticated) {
    navigate(targetPath);
    return true;
  }
  redirectToSignIn(navigate, returnPath);
  return false;
};
