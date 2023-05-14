/*
NOTES:
    - I implemented both search on change and search on button press 
      functionalities, but one is commented out because there is no point of 
      them running simultaneously (althoug they would work together)
    - Click on plus/minus icon alerts number of VISBLE empty cells (it wasnt
      really specified whether to count only visible or all of them, so I opted
      for the first option)
*/

const data = [
    {
        title: "Day of the Dragon",
        author: "Richard A. Knaak",
        quantity: 10,
        unit_price: 9,
        total_value: null,
    },
    {
        title: "A Wizard of Earthsea",
        author: "Ursula K. Le Guin",
        quantity: null,
        unit_price: 10,
        total_value: 40,
    },
    {
        title: "Homeland",
        author: "Robert A. Salvatore",
        quantity: 8,
        unit_price: null,
        total_value: 96,
    },
    {
        title: "Canticle",
        author: "Robert A. Salvatore",
        quantity: 13,
        unit_price: 23,
        total_value: null,
    },
    {
        title: "Gamedec. Granica rzeczywistości",
        author: "Marcin Przybyłek",
        quantity: null,
        unit_price: 25,
        total_value: 50,
    },
    {
        title: "The Night Has Come",
        author: "Stephen King",
        quantity: 30,
        unit_price: null,
        total_value: 900,
    },
    {
        title: "The Sphinx",
        author: "Graham Masterton",
        quantity: 3,
        unit_price: null,
        total_value: 300,
    },
    {
        title: "Charnel House",
        author: "Graham Masterton",
        quantity: null,
        unit_price: 20,
        total_value: 60,
    },
    {
        title: "The Devils of D-Day",
        author: "Graham Masterton",
        quantity: 10,
        unit_price: 16,
        total_value: null,
    },
];

const metadata = [
    {
        id: "title",
        type: "string",
        label: "Title",
    },
    {
        id: "author",
        type: "string",
        label: "Author",
    },
    {
        id: "quantity",
        type: "number",
        label: "Quantity",
    },
    {
        id: "unit_price",
        type: "number",
        label: "Unit price",
    },
    {
        id: "total_value",
        type: "number",
        label: "Total (Quantity * Unit price)",
    },
];

const additionalDataFromBooksDB = [
    {
        title: "Day of the Dragon",
        author: "Richard A. Knaak",
        genre: "fantasy",
        pages: 378,
        rating: 3.81,
    },
    {
        title: "A Wizard of Earthsea",
        author: "Ursula K. Le Guin",
        genre: "fantasy",
        pages: 183,
        rating: 4.01,
    },
    {
        title: "Homeland",
        author: "Robert A. Salvatore",
        genre: "fantasy",
        pages: 343,
        rating: 4.26,
    },
    {
        title: "Canticle",
        author: "Robert A. Salvatore",
        genre: "fantasy",
        pages: 320,
        rating: 4.03,
    },
    {
        title: "Gamedec. Granica rzeczywistości",
        author: "Marcin Przybyłek",
        genre: "cyberpunk",
        pages: 364,
        rating: 3.89,
    },
    {
        title: "The Night Has Come",
        author: "Stephen King",
        genre: "post apocalyptic",
        pages: 186,
        rating: 4.55,
    },
    {
        title: "The Sphinx",
        author: "Graham Masterton",
        genre: "horror",
        pages: 207,
        rating: 3.14,
    },
    {
        title: "Charnel House",
        author: "Graham Masterton",
        genre: "horror",
        pages: 123,
        rating: 3.61,
    },
    {
        title: "The Devils of D-Day",
        author: "Graham Masterton",
        genre: "horror",
        pages: 243,
        rating: "3.62",
    },
];
const additionalMetadataFromBooksDB = [
    {
        id: "title",
        type: "string",
        label: "Title",
    },
    {
        id: "author",
        type: "string",
        label: "Author",
    },
    {
        id: "genre",
        type: "string",
        label: "Genre",
    },
    {
        id: "pages",
        type: "number",
        label: "Pages",
    },
    {
        id: "rating",
        type: "number",
        label: "Rating",
    },
];

const searchInputElement = document.body.querySelector("input.search-input");
const searchButtonElement = document.body.querySelector("button.search-go");
const searchResetElement = document.body.querySelector("button.search-reset");

const columnHideElement = document.body.querySelector("button.column-hide");
const columnShowElement = document.body.querySelector("button.column-show");
const columnResetElement = document.body.querySelector("button.column-reset");

const markButtonElement = document.body.querySelector("button.function-mark");
const fillButtonElement = document.body.querySelector("button.function-fill");
const countButtonElement = document.body.querySelector("button.function-count");
const computeTotalsButtonElement = document.body.querySelector(
    "button.function-totals"
);
const resetFunctionButtonElement = document.body.querySelector(
    "button.function-reset"
);

class Grid {
    constructor() {
        // merge original metadata and BooksDB metadata
        this.metadata = metadata.concat(
            additionalMetadataFromBooksDB.filter((d) => {
                return d.id != "title" && d.id != "author";
            })
        );

        // merge original data and BooksDB data
        this.data = [];
        for (let i = 0; i < data.length; i++) {
            const additionalDataIndex = additionalDataFromBooksDB.findIndex(
                (d) => {
                    return (
                        d.title == data[i].title && d.author == data[i].author
                    );
                }
            );
            this.data.push({
                ...data[i],
                ...additionalDataFromBooksDB[additionalDataIndex],
            });
        }

        // HINT: below map can be useful for view operations ;))
        this.dataViewRef = new Map();

        Object.freeze(this.data);
        Object.freeze(this.metadata);

        this.render();
        this.live();
    }

    render() {
        this.table = document.createElement("table");

        this.head = this.table.createTHead();
        this.body = this.table.createTBody();

        this.renderHead();
        this.renderBody();

        document.body.append(this.table);
    }

    renderHead() {
        const row = this.head.insertRow();

        for (const column of this.metadata) {
            const cell = row.insertCell();

            cell.innerText = column.label;
        }
    }

    renderBody() {
        for (const dataRow of this.data) {
            const row = this.body.insertRow();

            for (const column of this.metadata) {
                const cell = row.insertCell();

                cell.classList.add(column.type);
                cell.innerText = dataRow[column.id];
            }

            // connect data row reference with view row reference
            this.dataViewRef.set(dataRow, row);
        }
    }

    live() {
        searchButtonElement.addEventListener(
            "click",
            this.onSearchGo.bind(this)
        );
        searchInputElement.addEventListener(
            "input", //changed to input from keydown
            this.onSearchChange.bind(this)
        );
        searchResetElement.addEventListener(
            "click",
            this.onSearchReset.bind(this)
        );

        columnHideElement.addEventListener(
            "click",
            this.onColumnHideClick.bind(this)
        );
        columnShowElement.addEventListener(
            "click",
            this.onColumnShowClick.bind(this)
        );
        columnResetElement.addEventListener(
            "click",
            this.onColumnReset.bind(this)
        );

        markButtonElement.addEventListener(
            "click",
            this.onMarkEmptyClick.bind(this)
        );
        fillButtonElement.addEventListener(
            "click",
            this.onFillTableClick.bind(this)
        );
        countButtonElement.addEventListener(
            "click",
            this.onCountEmptyClick.bind(this)
        );
        computeTotalsButtonElement.addEventListener(
            "click",
            this.onComputeTotalsClick.bind(this)
        );
        resetFunctionButtonElement.addEventListener(
            "click",
            this.onFunctionsResetClick.bind(this)
        );
    }

    onSearchGo(event) {
        // const keyword = searchInputElement.value.toLowerCase();
        // this.dataViewRef.forEach((rowRef, key, map) => {
        //     if (
        //         !key.title.toLowerCase().includes(keyword) &&
        //         !key.author.toLowerCase().includes(keyword)
        //     ) {
        //         rowRef.style.display = "none";
        //     }
        // });
    }

    onSearchChange(event) {
        const keyword = event.target.value.toLowerCase();
        this.dataViewRef.forEach((rowRef, key, map) => {
            if (
                !key.title.toLowerCase().includes(keyword) &&
                !key.author.toLowerCase().includes(keyword)
            ) {
                rowRef.style.display = "none";
            } else {
                rowRef.style.display = "table-row";
            }
        });
    }

    onSearchReset(event) {
        searchInputElement.value = "";
        this.dataViewRef.forEach((rowRef, key, map) => {
            rowRef.style.display = "table-row";
        });
    }

    onColumnHideClick(event) {
        //thead row
        const headCells = Array.from(this.head.firstChild.children);
        for (let i = 0; i < headCells.length; i++) {
            if (headCells[i].style.display != "none") {
                headCells[i].style.display = "none";
                break;
            }
        }

        //tbody rows
        this.dataViewRef.forEach((rowRef, key, map) => {
            const cells = Array.from(rowRef.children);
            for (let i = 0; i < cells.length; i++) {
                if (cells[i].style.display != "none") {
                    cells[i].style.display = "none";
                    break;
                }
            }
        });
    }

    onColumnShowClick(event) {
        //thead row
        const headCells = Array.from(this.head.firstChild.children);
        for (let i = 0; i < headCells.length; i++) {
            if (headCells[i].style.display == "none") {
                headCells[i].style.display = "table-cell";
                break;
            }
        }

        //tbody rows
        this.dataViewRef.forEach((rowRef, key, map) => {
            const cells = Array.from(rowRef.children);
            for (let i = 0; i < cells.length; i++) {
                if (cells[i].style.display == "none") {
                    cells[i].style.display = "table-cell";
                    break;
                }
            }
        });
    }

    onColumnReset(event) {
        const headCells = Array.from(this.head.firstChild.children);
        for (const cell of headCells) {
            cell.style.display = "table-cell";
        }

        this.dataViewRef.forEach((rowRef, key, map) => {
            const cells = Array.from(rowRef.children);
            for (let i = 0; i < cells.length; i++) {
                cells[i].style.display = "table-cell";
            }
        });
    }

    onMarkEmptyClick(event) {
        this.dataViewRef.forEach((rowRef, key, map) => {
            const cells = Array.from(rowRef.children);
            for (let i = 0; i < cells.length; i++) {
                if (
                    cells[i].classList.contains("number") &&
                    cells[i].innerText == ""
                ) {
                    cells[i].style.border = "2px solid red";
                }
            }
        });
    }

    onFillTableClick(event) {
        const quantityColumnIndex = this.metadata.findIndex(
            (element) => element.id == "quantity"
        );
        const unitPriceColumnIndex = this.metadata.findIndex(
            (element) => element.id == "unit_price"
        );
        const totalColumnIndex = this.metadata.findIndex(
            (element) => element.id == "total_value"
        );

        this.dataViewRef.forEach((rowRef, key, map) => {
            const cells = Array.from(rowRef.children);
            if (key.total_value == null) {
                cells[totalColumnIndex].innerText =
                    key.quantity * key.unit_price;
            } else if (key.unit_price == null) {
                cells[unitPriceColumnIndex].innerText =
                    key.total_value / key.quantity;
            } else if (key.quantity == null) {
                cells[quantityColumnIndex].innerText =
                    key.total_value / key.unit_price;
            }
        });
    }

    onCountEmptyClick(event) {
        let emptyCount = 0;
        this.dataViewRef.forEach((rowRef, key, map) => {
            const cells = Array.from(rowRef.children);
            if (rowRef.style.display != "none") {
                for (let i = 0; i < cells.length; i++) {
                    if (
                        cells[i].classList.contains("number") &&
                        cells[i].innerText == "" &&
                        cells[i].style.display != "none"
                    ) {
                        emptyCount += 1;
                    }
                }
            }
        });
        alert(`Found ${emptyCount} empty cells`);
    }

    onComputeTotalsClick(event) {
        let sumColumnIndex = null;
        let sum = 0;

        rowLoop: for (const [key, rowRef] of this.dataViewRef) {
            // loop over all rows
            if (sumColumnIndex == null && rowRef.style.display != "none") {
                const cells = Array.from(rowRef.children);
                for (let i = cells.length - 1; i >= 0; i--) {
                    // loop over cells/column
                    // search for index of first visible column with numeric data
                    if (
                        cells[i].style.display != "none" &&
                        cells[i].classList.contains("number")
                    ) {
                        // if found, save column index and increment sum by value of first matching row
                        sumColumnIndex = i;
                        sum += Number(cells[i].innerText);
                        continue rowLoop;
                    }
                }
                alert(`No visible column with numeric data was found!`);
                return; // return early and prevent sum alert if no column with numeric data found
            } else {
                if (rowRef.style.display != "none") {
                    // if column with numeric data was found, sum values from remaining rows
                    sum += Number(rowRef.children[sumColumnIndex].innerText);
                }
            }
        }

        // if numeric data column was found, early return wasnt triggered and we alert the sum
        const theadCells = Array.from(this.head.firstChild.children);
        const columnTitle = theadCells[sumColumnIndex].innerText;
        alert(`Sum of "${columnTitle}" equals ${sum}`);
    }

    onFunctionsResetClick(event) {
        const quantityColumnIndex = this.metadata.findIndex(
            (element) => element.id == "quantity"
        );
        const unitPriceColumnIndex = this.metadata.findIndex(
            (element) => element.id == "unit_price"
        );
        const totalColumnIndex = this.metadata.findIndex(
            (element) => element.id == "total_value"
        );

        this.dataViewRef.forEach((rowRef, key, map) => {
            const cells = Array.from(rowRef.children);
            for (let i = 0; i < cells.length; i++) {
                if (cells[i].classList.contains("number")) {
                    cells[i].style.border = "none";
                    switch (i) {
                        case quantityColumnIndex:
                            cells[i].innerText = key.quantity;
                            break;
                        case unitPriceColumnIndex:
                            cells[i].innerText = key.unit_price;
                            break;
                        case totalColumnIndex:
                            cells[i].innerText = key.total_value;
                            break;
                    }
                }
            }
        });
    }
}

class summaryGrid {
    constructor() {
        this.metadata = [
            {
                id: "author",
                type: "string",
                label: "Author",
            },
            {
                id: "titles",
                type: "number",
                label: "Titles",
            },
            {
                id: "total_quantity",
                type: "number",
                label: "Total Quantity",
            },
            {
                id: "total_revenue",
                type: "number",
                label: "Total Revenue",
            },
            {
                id: "avg_quantity",
                type: "number",
                label: "Avg Quantity",
            },
            {
                id: "avg_unit_price",
                type: "number",
                label: "Avg Unit Price",
            },
        ];

        this.data = new Map();
        for (const title of data) {
            let tQuantity = title.quantity != null ? title.quantity : 0;
            let tRevenue =
                tQuantity * (title.unit_price != null ? title.unit_price : 0);

            if (!this.data.has(title.author)) {
                this.data.set(title.author, {
                    titles: 1,
                    total_quantity: tQuantity,
                    total_revenue: tRevenue,
                    avg_quantity: tQuantity,

                    avg_unit_price:
                        title.unit_price != null ? title.unit_price : 0,

                    unit_price_sum:
                        this.unit_price != null ? title.unit_price : 0,
                });
            } else {
                const exisitingDataRow = this.data.get(title.author);
                let quantity = title.quantity != null ? title.quantity : 0;
                let revenue =
                    quantity *
                    (title.unit_price != null ? title.unit_price : 0);

                exisitingDataRow.titles += 1;
                exisitingDataRow.total_quantity += quantity;
                exisitingDataRow.total_revenue += revenue;

                exisitingDataRow.avg_quantity = toFixed(
                    exisitingDataRow.total_quantity / exisitingDataRow.titles,
                    2
                );

                exisitingDataRow.unit_price_sum +=
                    title.unit_price != null ? title.unit_price : 0;

                exisitingDataRow.avg_unit_price = toFixed(
                    exisitingDataRow.unit_price_sum / exisitingDataRow.titles,
                    2
                );
            }
        }

        Object.freeze(this.data);
        Object.freeze(this.metadata);

        this.render();
    }

    // rest is basicly copied from class Grid, except for small changes in
    // renderBody method (because of this.data now being a map, not an array)
    render() {
        this.table = document.createElement("table");

        this.head = this.table.createTHead();
        this.body = this.table.createTBody();

        this.renderHead();
        this.renderBody();

        document.body.append(this.table);
    }

    renderHead() {
        const row = this.head.insertRow();

        for (const column of this.metadata) {
            const cell = row.insertCell();

            cell.innerText = column.label;
        }
    }

    renderBody() {
        this.data.forEach((data, author, map) => {
            const row = this.body.insertRow();

            for (const column of this.metadata) {
                const cell = row.insertCell();

                cell.classList.add(column.type);
                if (column.id == "author") {
                    cell.innerText = author;
                } else {
                    cell.innerText = data[column.id];
                }
            }
        });

        for (const dataRow of this.data) {
        }
    }
}

function toFixed(number, decimalPlaces) {
    // this function takes a number and strips it
    // to show at most given number of decimal places
    return number.toFixed(decimalPlaces).replace(/\.?0+$/, "");
}

new Grid();
new summaryGrid();
