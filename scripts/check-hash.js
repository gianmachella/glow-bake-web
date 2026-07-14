import bcrypt from "bcryptjs";

const plain = "GE1131ge!!";
const hash = "$2b$10$L40NqQYQM.8aVLOPtp0xReyAue6LhMn0sZsj/MOKh6S35dA5ruYKe";

bcrypt.compare(plain, hash).then((isValid) => {
  console.log("¿Coincide?", isValid);
});
