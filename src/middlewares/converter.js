class Converter {
  codeMessage = message => {
    if (message.includes(`'`)) {
      while (message.includes(`'`)) {
        message = message.replace(`'`, "&apos;");
      }
    }
    if (message.endsWith("\\")) {
      message = message.slice(0, -1) + "&bsol;";
    }

    return message;
  };

  decodeMessage = message => {
    if (message.includes(`&apos;`)) {
      while (message.includes("&apos;")) {
        message = message.replace("&apos;", `'`);
      }
    }

    if (message.endsWith("&bsol;")) {
      message = message.slice(0, -6) + "\\";
    }

    return message;
  };
}

export default new Converter();
