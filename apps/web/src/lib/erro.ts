export class ApiErro extends Error {
  constructor(public status: number, mensagem: string) {
    super(mensagem);
  }
}
