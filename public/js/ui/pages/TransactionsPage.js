/**
 * Класс TransactionsPage управляет
 * страницей отображения доходов и
 * расходов конкретного счёта
 * */
class TransactionsPage {
  /**
   * Если переданный элемент не существует,
   * необходимо выкинуть ошибку.
   * Сохраняет переданный элемент и регистрирует события
   * через registerEvents()
   * */
  constructor(element) {
    if (!element) {
      throw new Error("Нет такого элемента");
    }
    this.element = element;
    this.registerEvents();
    this.lastOptions = null;
  }

  /**
   * Вызывает метод render для отрисовки страницы
   * */
  update() {
    if (!this.lastOptions) {
      return;
    }
    this.render(this.lastOptions);
  }

  /**
   * Отслеживает нажатие на кнопку удаления транзакции
   * и удаления самого счёта. Внутри обработчика пользуйтесь
   * методами TransactionsPage.removeTransaction и
   * TransactionsPage.removeAccount соответственно
   * */
  registerEvents() {
    const btnRemoveAccount = this.element.querySelector(".remove-account");
    btnRemoveAccount.addEventListener("click", () => {
      this.removeAccount();
    });

    this.element.addEventListener("click", (event) => {
      if (event.target.classList.contains("transaction__remove")) {
        const transactionId = event.target.closest(".transaction").dataset.id;
        this.removeTransaction(transactionId);
      }
    });
  }

  /**
   * Удаляет счёт. Необходимо показать диаголовое окно (с помощью confirm())
   * Если пользователь согласен удалить счёт, вызовите
   * Account.remove, а также TransactionsPage.clear с
   * пустыми данными для того, чтобы очистить страницу.
   * По успешному удалению необходимо вызвать метод App.updateWidgets() и App.updateForms(),
   * либо обновляйте только виджет со счетами и формы создания дохода и расхода
   * для обновления приложения
   * */
  removeAccount() {
    if (!this.lastOptions) {
      return;
    }

    const confirmed = confirm("Вы действительно хотите удалить счёт?");
    if (!confirmed) {
      return;
    }

    const accountId = this.lastOptions.account_id;

    Account.remove({ id: accountId }, (err, response) => {
      if (err) {
        console.error(err);
        return;
      }

      if (response.success) {
        this.clear();
        App.updateWidgets();
        App.updateForms();
      }
    });
  }

  /**
   * Удаляет транзакцию (доход или расход). Требует
   * подтверждеия действия (с помощью confirm()).
   * По удалению транзакции вызовите метод App.update(),
   * либо обновляйте текущую страницу (метод update) и виджет со счетами
   * */
  removeTransaction(id) {
    if (!confirm("Вы действительно хотите удалить эту транзакцию?")) return;

    Transaction.remove({ id }, () => {
      this.update();
      App.updateWidgets();
    });
  }

  /**
   * С помощью Account.get() получает название счёта и отображает
   * его через TransactionsPage.renderTitle.
   * Получает список Transaction.list и полученные данные передаёт
   * в TransactionsPage.renderTransactions()
   * */
  render(options) {
    if (!options || !options.account_id) {
      return;
    }

    this.lastOptions = options;
    const accountId = options.account_id;

    Account.get(accountId, (err, response) => {
      if (response && response.data) {
        this.renderTitle(response.data.name);
      }
    });

    Transaction.list({ account_id: accountId }, (err, response) => {
      if (response && response.data) {
        this.renderTransactions(response.data);
      }
    });
  }

  /**
   * Очищает страницу. Вызывает
   * TransactionsPage.renderTransactions() с пустым массивом.
   * Устанавливает заголовок: «Название счёта»
   * */
  clear() {
    this.renderTransactions([]);
    this.renderTitle("Название счёта");
    this.lastOptions = null;
  }

  /**
   * Устанавливает заголовок в элемент .content-title
   * */
  renderTitle(name) {
    const title = this.element.querySelector(".content-title");
    if (title) {
      title.textContent = name;
    }
  }

  /**
   * Форматирует дату в формате 2019-03-10 03:20:41 (строка)
   * в формат «10 марта 2019 г. в 03:20»
   * */
  formatDate(date) {
    const months = [
      "января",
      "февраля",
      "марта",
      "апреля",
      "мая",
      "июня",
      "июля",
      "августа",
      "сентября",
      "октября",
      "ноября",
      "декабря",
    ];

    const d = new Date(date.replace(" ", "T"));

    const day = d.getDate();
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");

    return `${day} ${month} ${year} г. в ${hours}:${minutes}`;
  }

  /**
   * Формирует HTML-код транзакции (дохода или расхода).
   * item - объект с информацией о транзакции
   * */
  getTransactionHTML(item) {
    const typeClass =
      item.type.toLowerCase() === "expense"
        ? "transaction_expense"
        : "transaction_income";

    const date = this.formatDate(item.created_at);

    return `
    <div class="transaction ${typeClass} row" data-id="${item.id}">
      <div class="col-md-7 transaction__details">
        <div class="transaction__icon">
          <span class="fa fa-money fa-2x"></span>
        </div>
        <div class="transaction__info">
          <h4 class="transaction__title">${item.name}</h4>
          <div class="transaction__date">${date}</div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="transaction__summ">
          ${item.sum} <span class="currency">₽</span>
        </div>
      </div>
      <div class="col-md-2 transaction__controls">
        <button class="btn btn-danger transaction__remove" data-id="${item.id}">
          <i class="fa fa-trash"></i>
        </button>
      </div>
    </div>
  `;
  }

  /**
   * Отрисовывает список транзакций на странице
   * используя getTransactionHTML
   * */
  renderTransactions(data) {
    const content = this.element.querySelector(".content");
    if (!content) {
      return;
    }

    content.innerHTML = "";

    data.forEach((item) => {
      content.insertAdjacentHTML("beforeend", this.getTransactionHTML(item));
    });
  }
}
