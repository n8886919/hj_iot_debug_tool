export const toOnlyTimeString = (s) => {
  const time = new Date(s * 1000);
  // return `${time.getFullYear()} / ${time.getMonth()} / ${time.getDate()} ${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`;
  const format = new Intl.DateTimeFormat("zh-TW", {
    timeStyle: "medium",
  });
  const msString = time.getMilliseconds().toString();
  const prefix = Array(3 - msString.length)
    .fill("0")
    .join();
  return format.format(time) + "." + prefix + time.getMilliseconds();
};
