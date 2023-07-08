import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IData } from "../types/data.interface";
import { IDataItem } from "../types/dataItem.interface";

export interface CartSliceState {
	totalPrice: number;
	items: IDataItem[];
}

interface IFindExistingItemPayload {
	id: string;
	type: string;
	size: number;
}

interface IRemoveItemPayload {
	id: string;
	type: string;
	size: number;
}

interface IFindExistingItemFunction {
	(items: IDataItem[], payload: IFindExistingItemPayload):
		| IDataItem
		| undefined;
}

interface IOnRemoveItemFunction {
	(items: IDataItem[], payload: IRemoveItemPayload): IDataItem[];
}

interface ICalculateTotalPriceFunction {
	(items: IDataItem[]): number;
}

const findExistingItem: IFindExistingItemFunction = (items, payload) => {
	return items.find(item => {
		return (
			item.id === payload.id &&
			item.type === payload.type &&
			item.size === payload.size
		);
	});
};

const onRemoveItem: IOnRemoveItemFunction = (items, payload) => {
	return items.filter(item => {
		return (
			item.id !== payload.id ||
			item.type !== payload.type ||
			item.size !== payload.size
		);
	});
};

const calculateTotalPrice: ICalculateTotalPriceFunction = items => {
	if (items.length === 0) {
		return 0;
	} else {
		return items.reduce((sum, obj) => {
			return obj.price * obj.count + sum;
		}, 0);
	}
};

const initialState: CartSliceState = {
	items: [],
	totalPrice: 0
};

export const cartSlice = createSlice({
	name: "cart",
	initialState,
	reducers: {
		addItem(state, action: PayloadAction<IDataItem>) {
			const existingItem = findExistingItem(state.items, {
				id: action.payload.id,
				type: action.payload.type,
				size: action.payload.size
			});

			if (existingItem) {
				existingItem.count += 1;
			} else {
				state.items.push({
					...action.payload,
					count: 1
				});
			}
			state.totalPrice = calculateTotalPrice(state.items);
		},

		minusItem(state, action: PayloadAction<IDataItem>) {
			const existingItem = findExistingItem(state.items, {
				id: action.payload.id,
				type: action.payload.type,
				size: action.payload.size
			});

			if (existingItem && existingItem.count !== 1) {
				existingItem.count -= 1;
			} else if (existingItem && existingItem.count === 1) {
				state.items = onRemoveItem(state.items, {
					id: action.payload.id,
					type: action.payload.type,
					size: action.payload.size
				});
			}
			state.totalPrice = calculateTotalPrice(state.items);
		},

		plusItem(state, action: PayloadAction<IDataItem>) {
			const existingItem = findExistingItem(state.items, {
				id: action.payload.id,
				type: action.payload.type,
				size: action.payload.size
			});

			if (existingItem) {
				existingItem.count++;
			}
			state.totalPrice = calculateTotalPrice(state.items);
		},

		removeItem(state, action: PayloadAction<IRemoveItemPayload>) {
			state.items = onRemoveItem(state.items, action.payload);
			state.totalPrice = calculateTotalPrice(state.items);
		},

		clearItems(state) {
			state.items = [];
			state.totalPrice = calculateTotalPrice(state.items);
		}
	}
});

export const getItemsList = state => state.cart.items;
export const getTotalPrice = state => state.cart.totalPrice;

export const { addItem, removeItem, clearItems, minusItem, plusItem } =
	cartSlice.actions;
