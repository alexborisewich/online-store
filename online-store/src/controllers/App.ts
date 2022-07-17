import AppModel from '../models/AppModel';
import AppView from '../views/AppView';

export default class App {
  state: { url: string };

  constructor() {
    this.state = {
      url: 'https://makeup-api.herokuapp.com/api/v1/products.json',
    };
  }

  async start() {
    const model = new AppModel(this.state);
    const data = await model.getProductsValues();
    const brands = model.extractUniqueValues(data, 'brand');
    const categories = model.extractUniqueValues(data, 'category');
    const types = model.extractUniqueValues(data, 'product_type');
    const view = new AppView(data, brands, categories, types);
    view.render();
    view.initSlider('price');
    view.initSlider('rating');
    view.addCheckboxFilter('brands');
    view.addCheckboxFilter('categories');
    view.addCheckboxFilter('types');
    view.checkCart();
    view.search();
    view.reset();
    view.loadSettings();
  }
}
