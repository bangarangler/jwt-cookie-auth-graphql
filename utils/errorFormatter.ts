export const errorFormatter = (source: string, message: string) => {
  return {
    errors: [
      {
        source,
        message,
      },
    ],
  };
};
