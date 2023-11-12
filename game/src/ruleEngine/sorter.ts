
export default function insertSorted<T>(element: T, array: Array<T>, comparer: (a: any, b: any) => number) {
    var start = locationOf(element, array, comparer, 0, array.length) + 1;
    array.splice(start, 0, element);
}

function locationOf<T>(element: T, array: Array<T>, comparer: (a: any, b: any) => number, start: number, end: number): number {
    if (array.length == 0)
        return -1;

    var pivot = (start + end) >> 1;

    var c = comparer(element, array[pivot]);
    if (end - start <= 1) 
        return c == -1 ? pivot - 1 : pivot;

    switch (c) {
        case -1: return locationOf(element, array, comparer, start, pivot);
        case 0: return pivot;
        case 1: return locationOf(element, array, comparer, pivot, end);
    };

    return -1;
};
