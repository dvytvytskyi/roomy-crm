"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionStatus = exports.TransactionType = exports.AdjustmentType = exports.ReservationSource = exports.GuestStatus = exports.PaymentStatus = exports.ReservationStatus = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "ADMIN";
    UserRole["MANAGER"] = "MANAGER";
    UserRole["AGENT"] = "AGENT";
    UserRole["OWNER"] = "OWNER";
    UserRole["GUEST"] = "GUEST";
    UserRole["CLEANER"] = "CLEANER";
    UserRole["MAINTENANCE"] = "MAINTENANCE";
})(UserRole || (exports.UserRole = UserRole = {}));
var ReservationStatus;
(function (ReservationStatus) {
    ReservationStatus["PENDING"] = "PENDING";
    ReservationStatus["CONFIRMED"] = "CONFIRMED";
    ReservationStatus["CANCELLED"] = "CANCELLED";
    ReservationStatus["COMPLETED"] = "COMPLETED";
    ReservationStatus["NO_SHOW"] = "NO_SHOW";
    ReservationStatus["MODIFIED"] = "MODIFIED";
})(ReservationStatus || (exports.ReservationStatus = ReservationStatus = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["UNPAID"] = "UNPAID";
    PaymentStatus["PARTIALLY_PAID"] = "PARTIALLY_PAID";
    PaymentStatus["FULLY_PAID"] = "FULLY_PAID";
    PaymentStatus["REFUNDED"] = "REFUNDED";
    PaymentStatus["PENDING_REFUND"] = "PENDING_REFUND";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
var GuestStatus;
(function (GuestStatus) {
    GuestStatus["UPCOMING"] = "UPCOMING";
    GuestStatus["CHECKED_IN"] = "CHECKED_IN";
    GuestStatus["CHECKED_OUT"] = "CHECKED_OUT";
    GuestStatus["NO_SHOW"] = "NO_SHOW";
    GuestStatus["CANCELLED"] = "CANCELLED";
})(GuestStatus || (exports.GuestStatus = GuestStatus = {}));
var ReservationSource;
(function (ReservationSource) {
    ReservationSource["DIRECT"] = "DIRECT";
    ReservationSource["AIRBNB"] = "AIRBNB";
    ReservationSource["BOOKING_COM"] = "BOOKING_COM";
    ReservationSource["VRBO"] = "VRBO";
    ReservationSource["OTHER"] = "OTHER";
})(ReservationSource || (exports.ReservationSource = ReservationSource = {}));
var AdjustmentType;
(function (AdjustmentType) {
    AdjustmentType["DISCOUNT"] = "DISCOUNT";
    AdjustmentType["FEE"] = "FEE";
    AdjustmentType["REFUND"] = "REFUND";
    AdjustmentType["DAMAGE"] = "DAMAGE";
    AdjustmentType["OTHER"] = "OTHER";
})(AdjustmentType || (exports.AdjustmentType = AdjustmentType = {}));
var TransactionType;
(function (TransactionType) {
    TransactionType["PAYMENT"] = "PAYMENT";
    TransactionType["REFUND"] = "REFUND";
    TransactionType["CHARGE"] = "CHARGE";
    TransactionType["WITHDRAWAL"] = "WITHDRAWAL";
    TransactionType["COMMISSION"] = "COMMISSION";
    TransactionType["FEE"] = "FEE";
})(TransactionType || (exports.TransactionType = TransactionType = {}));
var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus["PENDING"] = "PENDING";
    TransactionStatus["COMPLETED"] = "COMPLETED";
    TransactionStatus["FAILED"] = "FAILED";
    TransactionStatus["CANCELLED"] = "CANCELLED";
    TransactionStatus["REFUNDED"] = "REFUNDED";
})(TransactionStatus || (exports.TransactionStatus = TransactionStatus = {}));
//# sourceMappingURL=types.js.map