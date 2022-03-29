import db from "../db/connection";

export const selectAllBlogPosts = async (
  page = "1",
  limit = "10",
  title: string,
  author: string,
  tag: string
) => {
  const paramsObj: any = {
    page,
    limit,
    title,
    author,
    tag,
  };

  // console.log(paramsObj);

  const availableData = [
    ...Object.keys(paramsObj)
      .filter((key) => {
        if (paramsObj[key] !== undefined) return key;
      })
      .map((el, i) => {
        if (el === "tag") {
          //if we have multiple tags => [tag1 , tag2]
          if (Array.isArray(paramsObj[el])) {
            // we spread the tag into multiple queries
            const tagsQuery = paramsObj[el]
              .map((tag: string, i2: number) => {
                //TODO: Bad query, parameters cannot be combined with multiple tags
                const query = `${
                  i === 2 ? "WHERE" : i2 === 0 ? "AND" : "OR"
                } $${
                  //match the next idex for db query
                  i + 1
                } = any (tags)`;

                i++;
                return query;
              })
              .join(" ");

            return tagsQuery;
          } else {
            //if we don't have an array, we create only 1 query
            return `${i === 2 ? "WHERE" : "AND"} $${i + 1} = any (tags)`;
          }
        }

        if (el !== "page" && el !== "limit") {
          return `${i === 2 ? "WHERE" : "AND"} ${el} ~* $${i + 1}`;
        }
      }),
  ].join(" ");

  // console.log(availableData, "===");
  // console.log(
  //   ...Object.values(paramsObj)
  //     .filter((val) => {
  //       if (val !== undefined) return val;
  //     })
  //     .flat()
  // );

  const posts = await db.query(
    `
        SELECT * FROM blog_posts
        ${availableData}
        LIMIT $2 OFFSET(($1 - 1) * $2);
    `,
    [
      ...Object.values(paramsObj)
        .filter((val) => {
          if (val === undefined) return;

          return val;
        })
        .flat(),
    ]
  );
  return posts.rows;
};
