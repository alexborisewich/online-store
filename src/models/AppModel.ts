export default class AppModel {
  state: { url: string };

  constructor(state: { url: string }) {
    this.state = state;
  }

  static extractProducts(data: { [index: string]: string }[]) {
    return data;
  }

  extractUniqueValues(data: { [index: string]: string }[], str: string) {
    const valuesArr: string[] = [];
    data.forEach((product) => {
      valuesArr.push(product[`${str}`] ? product[`${str}`] : 'other');
    });
    return new Set(valuesArr);
  }

  async getProductsValues() {
    const { url } = this.state;
    try {
      const response: Response = await fetch(url);
      const data: { [index: string]: string }[] = await response.json();
      return AppModel.extractProducts(data);
    } catch (err) {
      throw new Error('Один из запросов завершился неудачно =(');
    }
  }
}
