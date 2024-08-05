const allowedOrigins = [
  "http://localhost:5173",
  "https://household-management-theta.vercel.app/",
];

const originHandler = (
  origin: string | undefined,
  callback: (error: Error | null, allowed?: boolean) => void
) => {
  if (!origin || allowedOrigins.includes(origin)) {
    callback(null, true);
  } else {
    callback(new Error("Not allowed by CORS"));
  }
};

export const corsOptions = {
  origin: originHandler,
  credentials: true,
  sameSite: "None",
};
