/**
 * Класс AccountsWidget управляет блоком
 * отображения счетов в боковой колонке
 * */

class AccountsWidget {
  /**
   * Устанавливает текущий элемент в свойство element
   * Регистрирует обработчики событий с помощью
   * AccountsWidget.registerEvents()
   * Вызывает AccountsWidget.update() для получения
   * списка счетов и последующего отображения
   * Если переданный элемент не существует,
   * необходимо выкинуть ошибку.
   * */
  constructor(element) {
    if (!element) {
      throw new Error("Нет такого элемента");
    }
    this.element = element;
    this.registerEvents();
    // this.update();
  }

  /**
   * При нажатии на .create-account открывает окно
   * #modal-new-account для создания нового счёта
   * При нажатии на один из существующих счетов
   * (которые отображены в боковой колонке),
   * вызывает AccountsWidget.onSelectAccount()
   * */
  registerEvents() {
    const btnCreate = this.element.querySelector(".create-account");
    if (btnCreate) {
      btnCreate.addEventListener("click", () => {
        App.getModal("createAccount").open();
      });
    }

    this.element.addEventListener("click", (event) => {
      const account = event.target.closest(".account");
      if (account) {
        this.onSelectAccount(account);
      }
    });
  }

  /**
   * Метод доступен только авторизованным пользователям
   * (User.current()).
   * Если пользователь авторизован, необходимо
   * получить список счетов через Account.list(). При
   * успешном ответе необходимо очистить список ранее
   * отображённых счетов через AccountsWidget.clear().
   * Отображает список полученных счетов с помощью
   * метода renderItem()
   * */
  update() {
    if (!User.current()) return;

    Account.list({}, (err, response) => {
      if (err) return;

      this.clear();
      response.data.forEach((account) => {
        this.renderItem(account);
      });
    });
  }

  /**
   * Очищает список ранее отображённых счетов.
   * Для этого необходимо удалять все элементы .account
   * в боковой колонке
   * */
  clear() {
    const accounts = this.element.querySelectorAll(".account");
    for (let account of accounts) {
      account.remove();
    }
  }

  /**
   * Срабатывает в момент выбора счёта
   * Устанавливает текущему выбранному элементу счёта
   * класс .active. Удаляет ранее выбранному элементу
   * счёта класс .active.
   * Вызывает App.showPage( 'transactions', { account_id: id_счёта });
   * */
  onSelectAccount(element) {
    const active = this.element.querySelector(".account.active");
    if (active) active.classList.remove("active");

    element.classList.add("active");

    const id = element.dataset.id;
    App.showPage("transactions", { account_id: id });
  }

  /**
   * Возвращает HTML-код счёта для последующего
   * отображения в боковой колонке.
   * item - объект с данными о счёте
   * */
  getAccountHTML(item) {
    const id = item.id;
    const name = item.name;
    const sum = item.sum;
    return `
  <li class="account" data-id="${id}">
    <a href="#">
      <span>${name}</span> /
      <span>${sum} ₽</span>
    </a>
  </li>
`;
  }

  /**
   * Получает массив с информацией о счетах.
   * Отображает полученный с помощью метода
   * AccountsWidget.getAccountHTML HTML-код элемента
   * и добавляет его внутрь элемента виджета
   * */
  renderItem(item) {
    const html = this.getAccountHTML(item);
    this.element.insertAdjacentHTML("beforeend", html);
  }
}
