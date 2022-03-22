const rejectQuery = (msg = "Bad request!", status = 400) => {
  return Promise.reject({ status, msg });
};

export default rejectQuery;
