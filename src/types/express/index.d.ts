declare namespace Express {
  interface Request {
    user: any;
    requestTime: any;
  }
}

declare module "xss-clean" {
  const value: Function;

  export default value;
}
