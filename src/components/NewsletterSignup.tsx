type NewsletterSignupProps = {
  title: string;
  description: string;
  emailInputId?: string;
};

export function NewsletterSignup({
  title,
  description,
  emailInputId = "newsletter-email",
}: NewsletterSignupProps) {
  const statusId = `${emailInputId}-status`;

  return (
    <div className="max-w-4xl mx-auto text-center relative z-10">
      <h2 className="serif text-5xl md:text-7xl mb-12">{title}</h2>
      <form
        className="flex flex-col md:flex-row gap-4 justify-center"
        onSubmit={(event) => event.preventDefault()}
        aria-describedby={statusId}
      >
        <label htmlFor={emailInputId} className="sr-only">
          Email address
        </label>
        <input
          id={emailInputId}
          type="email"
          placeholder="Enter your email"
          disabled
          aria-disabled="true"
          className="bg-white/10 border border-white/20 rounded-full px-8 py-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 min-w-[300px] disabled:cursor-not-allowed disabled:opacity-60"
        />
        <button
          type="submit"
          disabled
          aria-disabled="true"
          className="bg-white text-clir px-8 py-4 rounded-full font-bold transition-colors disabled:cursor-not-allowed disabled:bg-stone-100 disabled:text-stone-500"
        >
          Subscribe to Updates
        </button>
      </form>
      <p id={statusId} className="mt-8 text-white/40 text-sm font-medium">
        {description}
      </p>
    </div>
  );
}
