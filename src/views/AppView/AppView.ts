export default class AppView {
  products: { [index: string]: string }[];

  brands: Set<string>;

  categories: Set<string>;

  types: Set<string>;

  cart: { [index: string]: number } = {};

  sortDateSwitcher: boolean;

  sortNameSwitcher: boolean;

  checked: { [index: string]: string[] };

  constructor(
    products: { [index: string]: string }[],
    brands: Set<string>,
    categories: Set<string>,
    types: Set<string>
  ) {
    this.products = products;
    this.brands = brands;
    this.categories = categories;
    this.types = types;
    this.sortDateSwitcher = true;
    this.sortNameSwitcher = true;
    this.checked = {
      brands: [],
      categories: [],
      types: [],
    };
  }

  render(): void {
    const cardsContainer = document.querySelector('.cards') as HTMLElement;
    cardsContainer.innerHTML = '';
    this.products.forEach((product) => {
      const name: string = product.name
        .replace(new RegExp(`${product.brand}`, 'gi'), '')
        .replace(/[^a-zA-Zа-яА-Я0-9 ]/iu, '')
        .trim()
        .toLowerCase();
      const enterDate: string = new Date(product.created_at).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
      });
      const isAvailable: string | boolean = product.price && product.price !== '0.0';
      const price: string | boolean = isAvailable ? product.price : '';
      const rating: string = product.rating ? product.rating : '0';
      const brand: string = product.brand ? product.brand.replace('_', ' ') : 'other';
      const category: string = product.category ? product.category.replace('_', ' ') : 'other';
      const type: string = product.product_type.replace('_', ' ');
      const card = document.createElement('article');
      card.className = 'cards__item card';
      card.setAttribute('data-enter', product.created_at);
      card.setAttribute('data-id', product.id);
      card.innerHTML = `
      <div class="card__img-wrapper">
        <img class="card__img" src='${product.api_featured_image}' alt='${product.name}'>
      </div>
      <h2 class="card__name">${name}</h2>
      <p class="card__enter">Release date: ${enterDate}</p>
      <p class="card__brands">Brand: ${brand}</p>
      <p class="card__categories">Category: ${category}</p>
      <p class="card__types">Type: ${type}</p>
      <p class="card__available">${isAvailable ? 'Available' : 'Not available'}</p>
      <div class="card__rating">Rating: ${rating}</div>
      <p class="card__price">${price} ${isAvailable ? '$' : ''}</p>
      ${isAvailable ? '<button class="card__btn" data-id="' + product.id + '">BUY</button>' : ''}`;
      cardsContainer.append(card);
      const cardBtn = card.querySelector('.card__btn') as HTMLElement;
      if (cardBtn) {
        cardBtn.addEventListener('click', (e: MouseEvent): void => {
          card.classList.toggle('cards__item_checked');
          const target = e.target as HTMLElement;
          const id = target.getAttribute('data-id');
          if (id) this.addToCart(id, target);
          this.showMiniCart();
        });
      }
    });

    const dateSort = document.querySelector('.filter-order__date-link') as HTMLElement;
    dateSort.addEventListener('click', this.sortByDate);
    const nameSort = document.querySelector('.filter-order__name-link') as HTMLElement;
    nameSort.addEventListener('click', this.sortByName);
  }

  addCheckboxFilter(str: string) {
    const filterContainer = document.querySelector(`.filter__${str}-sort`) as HTMLElement;
    filterContainer.innerHTML = '';
    const title = document.createElement('h3');
    title.classList.add('filter-sort__subtitle');
    title.classList.add('filter-subtitle');
    title.innerHTML = `${str}:`;
    filterContainer.append(title);
    const filterItemsContainer = document.createElement('ul');
    filterItemsContainer.classList.add('filter-sort__list');
    filterContainer.append(filterItemsContainer);

    const filterAllItem = document.createElement('li');
    filterAllItem.classList.add('filter-sort__item');
    filterAllItem.innerHTML = `<label class="filter-sort__label-${str}">
    <input class="filter-sort__input-${str}" type="checkbox" id="${str}-all" checked>all
    </label>`;
    filterItemsContainer.appendChild(filterAllItem);

    const callback = (e: Event) => {
      const target = e.target as HTMLInputElement;
      this.sortByCheckbox(target, str);
      this.saveSettings();
    };
    const checkbox = filterAllItem.querySelector(`.filter-sort__input-${str}`) as HTMLInputElement;
    checkbox.addEventListener('click', callback);

    const filterTypes: { [index: string]: Set<string> } = {
      brands: this.brands,
      categories: this.categories,
      types: this.types,
    };
    Array.from(filterTypes[`${str}`])
      .sort()
      .map((item) => {
        const filterItem = document.createElement('li');
        filterItem.classList.add('filter-sort__item');
        filterItem.innerHTML = `<label class="filter-sort__label-${str}">
        <input class="filter-sort__input-${str}" type="checkbox"
        id="${str + '-' + item.replace('_', ' ')}">${item.replace('_', ' ')}
        </label>`;
        filterItemsContainer.appendChild(filterItem);
        // const checkbox = filterItem.querySelector(`.filter-sort__input-${str}`) as HTMLInputElement;
        checkbox.addEventListener('click', callback);
      });
  }

  sortByCheckbox(target: HTMLInputElement, str: string) {
    const cards = document.querySelectorAll('.card');
    const checkboxes = document.querySelectorAll(`.filter-sort__input-${str}`);
    const targetLabel = ((target.parentNode as HTMLLabelElement).textContent as string).toLowerCase().trim();

    if (target.checked) {
      if (targetLabel != 'all') {
        this.checked[`${str}`].push(targetLabel);
      } else {
        this.checked[`${str}`].length = 0;
        checkboxes.forEach((checkbox) => {
          const label = ((checkbox.parentNode as HTMLLabelElement).textContent as string).toLowerCase().trim();
          if (label != 'all') {
            this.checked[`${str}`].push(label);
          }
        });
      }
    } else {
      if (targetLabel != 'all') {
        this.checked[`${str}`].splice(this.checked[`${str}`].indexOf(targetLabel), 1);
      } else {
        this.checked[`${str}`].length = 0;
        checkboxes.forEach((checkbox) => {
          const label = ((checkbox.parentNode as HTMLLabelElement).textContent as string).toLowerCase().trim();
          if (label != 'all' && (checkbox as HTMLInputElement).checked) {
            this.checked[`${str}`].push(label);
          }
        });
      }
    }

    cards.forEach((card) => {
      const compareText = ((card.querySelector(`.card__${str}`) as HTMLElement).textContent as string)
        .toLowerCase()
        .split(':')[1]
        .trim();
      if (!this.checked[`${str}`].includes(compareText)) {
        card.classList.add(`hide-${str}`);
      } else {
        card.classList.remove(`hide-${str}`);
      }
    });
  }

  sortByDate() {
    const direction = {
      forward: function (a: string, b: string) {
        return +a - +b;
      },
      back: function (a: string, b: string) {
        return +b - +a;
      },
    };
    const cards = document.querySelectorAll('.card');
    const cardsContainer = document.querySelector('.cards') as HTMLElement;
    const sortElements: { [dateValue: string]: { [item: string]: number | Element } } = {};
    cards.forEach((card, indx) => {
      const dateValue: number = new Date(card.getAttribute('data-enter') as string).getTime();
      if ((card as HTMLElement).style.display != 'none') {
        sortElements[dateValue] = { element: card, index: indx };
      }
    });
    const keys = Object.keys(sortElements);
    (() => {
      this.sortDateSwitcher = !this.sortDateSwitcher;
      keys.sort(direction[this.sortDateSwitcher ? 'forward' : 'back']);
    })();
    keys.map((key) => cardsContainer.insertAdjacentElement('beforeend', sortElements[key].element as Element));
  }

  sortByName() {
    const direction = {
      forward: (a: string, b: string) => {
        if (a < b) {
          return -1;
        }
        if (a > b) {
          return 1;
        }
        return 0;
      },
      back: (a: string, b: string) => {
        if (a > b) {
          return -1;
        }
        if (a < b) {
          return 1;
        }
        return 0;
      },
    };
    const cards = document.querySelectorAll('.card');
    const cardsContainer = document.querySelector('.cards') as HTMLElement;
    const sortElements: { [dateValue: string]: { [item: string]: number | Element } } = {};
    let count = 0;
    cards.forEach(function (card, indx) {
      const cardName: string = (card.querySelector('.card__name') as HTMLElement).textContent as string;
      if ((card as HTMLElement).style.display != 'none') {
        if (Object.prototype.hasOwnProperty.call(sortElements, `${cardName}`)) {
          sortElements[cardName + ++count] = { element: card, index: indx };
        } else {
          sortElements[cardName] = { element: card, index: indx };
        }
      }
    });

    const keys = Object.keys(sortElements);
    (() => {
      this.sortNameSwitcher = !this.sortNameSwitcher;
      keys.sort(direction[this.sortNameSwitcher ? 'forward' : 'back']);
    })();
    keys.map((key) => cardsContainer.insertAdjacentElement('beforeend', sortElements[key].element as Element));
  }

  initSlider(str: string) {
    const sliderFrom = document.getElementById(`${str}-slider-from`) as HTMLInputElement;
    const sliderTo = document.getElementById(`${str}-slider-to`) as HTMLInputElement;
    const valFrom = document.getElementById(`${str}-from`) as HTMLInputElement;
    const valTo = document.getElementById(`${str}-to`) as HTMLInputElement;
    const minGap = 0;
    const sliderTrack = document.getElementById(`${str}-slider-track`) as HTMLElement;

    this.slideOne(str, sliderFrom, sliderTo, valFrom, minGap, sliderTrack);
    sliderFrom.addEventListener('input', () => {
      this.slideOne(str, sliderFrom, sliderTo, valFrom, minGap, sliderTrack);
      this.saveSettings();
    });
    this.slideTwo(str, sliderFrom, sliderTo, valTo, minGap, sliderTrack);
    sliderTo.addEventListener('input', () => {
      this.slideTwo(str, sliderFrom, sliderTo, valTo, minGap, sliderTrack);
      this.saveSettings();
    });
  }

  slideOne(
    str: string,
    sliderFrom: HTMLInputElement,
    sliderTo: HTMLInputElement,
    valFrom: HTMLInputElement,
    minGap: number,
    sliderTrack: HTMLElement
  ) {
    const cards = document.querySelectorAll('.card');
    if (parseInt(sliderTo.value) - parseInt(sliderFrom.value) <= minGap) {
      sliderFrom.value = String(parseInt(sliderTo.value) - minGap);
    }
    valFrom.value = sliderFrom.value;
    this.fillColor(sliderFrom, sliderTo, sliderTrack);

    if (str == 'price') {
      cards.forEach((card) => {
        const price = +((card.querySelector('.card__price') as HTMLElement).textContent as string)
          .replace('$', '')
          .trim();
        if (price < +sliderFrom.value) {
          card.classList.add('hide-price');
        }
        if (price >= +sliderFrom.value && price <= +sliderTo.value) {
          card.classList.remove('hide-price');
        }
      });
    }
    if (str == 'rating') {
      cards.forEach((card) => {
        const rating = +((card.querySelector('.card__rating') as HTMLElement).textContent as string)
          .replace('Rating:', '')
          .trim();
        if (rating < +sliderFrom.value) {
          card.classList.add('hide-rating');
        }
        if (rating >= +sliderFrom.value && rating <= +sliderTo.value) {
          card.classList.remove('hide-rating');
        }
      });
    }
  }

  slideTwo(
    str: string,
    sliderFrom: HTMLInputElement,
    sliderTo: HTMLInputElement,
    valTo: HTMLInputElement,
    minGap: number,
    sliderTrack: HTMLElement
  ) {
    const cards = document.querySelectorAll('.card');
    if (parseInt(sliderTo.value) - parseInt(sliderFrom.value) <= minGap) {
      sliderTo.value = String(parseInt(sliderFrom.value) + minGap);
    }
    valTo.value = sliderTo.value;
    this.fillColor(sliderFrom, sliderTo, sliderTrack);
    if (str == 'price') {
      cards.forEach((card) => {
        const price = +((card.querySelector('.card__price') as HTMLElement).textContent as string)
          .replace('$', '')
          .trim();
        if (price > +sliderTo.value) {
          card.classList.add('hide-price');
        }
        if (price <= +sliderTo.value && price >= +sliderFrom.value) {
          card.classList.remove('hide-price');
        }
      });
    }
    if (str == 'rating') {
      cards.forEach((card) => {
        const rating = +((card.querySelector('.card__rating') as HTMLElement).textContent as string)
          .replace('Rating:', '')
          .trim();
        if (rating > +sliderTo.value) {
          card.classList.add('hide-rating');
        }
        if (rating <= +sliderTo.value && rating >= +sliderFrom.value) {
          card.classList.remove('hide-rating');
        }
      });
    }
  }

  fillColor(sliderFrom: HTMLInputElement, sliderTo: HTMLInputElement, sliderTrack: HTMLElement) {
    const percent1 = (+sliderFrom.value / +sliderFrom.max) * 100;
    const percent2 = (+sliderTo.value / +sliderFrom.max) * 100;
    sliderTrack.style.background = `linear-gradient(to right, #dadae5 ${percent1}%\n
      , #9b8d64 ${percent1}% , #9b8d64 ${percent2}%, #dadae5 ${percent2}%)`;
  }

  addToCart(id: string, target: HTMLElement) {
    if (!Object.keys(this.cart).length && id) this.cart[id] = 1;
    else if (Object.keys(this.cart).length && id && this.cart[id]) this.cart[id] = 0;
    else if (Object.values(this.cart).reduce((a, b) => a + b) < 20) {
      if (!this.cart[id] || this.cart[id] == 0) this.cart[id] = 1;
    } else {
      alert('Sorry, all slots are full');
      target.closest('.card')?.classList.remove('cards__item_checked');
    }
    localStorage.setItem('cart', JSON.stringify(this.cart));
  }

  checkCart() {
    const cardString = localStorage.getItem('cart');
    if (cardString) this.cart = JSON.parse(cardString);
    this.showMiniCart();
    const cards = document.querySelectorAll('.card');
    cards.forEach((card) => {
      const id = card.getAttribute('data-id') as string;
      if (this.cart[id] && this.cart[id] != 0) card.classList.add('cards__item_checked');
    });
  }

  showMiniCart() {
    let counter = 0;
    const miniCartCounter = document.querySelector('.mini-cart__counter') as HTMLElement;
    for (const id in this.cart) {
      counter += this.cart[id];
    }
    miniCartCounter.textContent = String(counter);
  }

  search() {
    const searchInput = document.querySelector('.search__input') as HTMLInputElement;
    function liveSearch(this: Element) {
      const value = (this as HTMLInputElement).value.toLowerCase().trim();
      const cards = document.querySelectorAll('.card');
      cards.forEach((card) => {
        const cardName: string = (card.querySelector('.card__name') as HTMLElement).textContent as string;
        const result = cardName.search(value);
        if (value !== '') {
          if (result == -1) {
            card.classList.add('hide-search');
          } else {
            card.classList.remove('hide-search');
          }
        } else card.classList.remove('hide-search');
      });
    }
    searchInput.addEventListener('input', liveSearch);
  }

  reset() {
    const filters = document.getElementById('filters') as HTMLFormElement;
    const search = document.getElementById('search') as HTMLFormElement;
    const resetBtn = document.querySelector('.filter__reset-btn');
    const clearBtn = document.querySelector('.filter__clear-btn');
    resetBtn?.addEventListener('click', () => {
      search.reset();
      filters?.reset();
    });
    clearBtn?.addEventListener('click', () => {
      localStorage.clear();
      location.reload();
    });
  }

  saveSettings() {
    const form = document.getElementById('filters') as HTMLFormElement;
    const data: { [index: string]: string | boolean } = {};
    [...form.elements].forEach((element: Element) => {
      if ((element as HTMLInputElement).type != 'checkbox') {
        data[element.id] = (element as HTMLInputElement).value;
      }

      if ((element as HTMLInputElement).type != 'range' && (element as HTMLInputElement).type != 'text') {
        data[element.id] = (element as HTMLInputElement).checked;
      }
    });
    localStorage.setItem('form', JSON.stringify(data));
  }

  loadSettings() {
    const form = document.getElementById('filters') as HTMLFormElement;
    const data = JSON.parse(localStorage.getItem('form') as string);
    if (data) {
      [...form.elements].forEach((element: Element) => {
        if ((element as HTMLInputElement).type != 'checkbox') {
          (element as HTMLInputElement).value = data[element.id];
          if ((element as HTMLInputElement).type != 'range' && (element as HTMLInputElement).type != 'text') {
            (element as HTMLInputElement).checked = data[element.id];
            if (data[element.id]) {
              this.sortByCheckbox(
                element as HTMLInputElement,
                ((element as HTMLInputElement).getAttribute('id') as string).split('-')[0]
              );
            }
          }
        }
      });
      this.initSlider('price');
      this.initSlider('rating');
    }
  }
}
