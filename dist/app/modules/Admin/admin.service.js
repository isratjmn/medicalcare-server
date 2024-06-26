"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const client_1 = require("@prisma/client");
const admin_constant_1 = require("./admin.constant");
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const calculatePagination = (options) => {
    const page = Number(options.page) || 1;
    const limit = Number(options.limit) || 10;
    const skip = (Number(page) - 1) * limit;
    const sortBy = options.sortBy || "createdAt";
    const sortOrder = options.sortOrder || "desc";
    return {
        page,
        limit,
        skip,
        sortBy,
        sortOrder,
    };
};
const getAllAdmin = (params, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { page, limit, skip } = calculatePagination(options);
    const { searchTerm } = params, filterData = __rest(params, ["searchTerm"]);
    const andConditions = [];
    if (searchTerm) {
        andConditions.push({
            OR: admin_constant_1.adminSearchableFields.map((field) => ({
                [field]: {
                    contains: searchTerm,
                    mode: "insensitive",
                },
            })),
        });
    }
    if (Object.keys(filterData).length > 0) {
        andConditions.push({
            AND: Object.keys(filterData).map((key) => ({
                [key]: {
                    equals: filterData[key],
                },
            })),
        });
    }
    andConditions.push({
        isDeleted: false,
    });
    const whereConditions = {
        AND: andConditions.length > 0 ? andConditions : undefined,
    };
    const result = yield prisma_1.default.admin.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: options.sortBy && options.sortOrder
            ? { [options.sortBy]: options.sortOrder }
            : { createdAt: "desc" },
    });
    const total = yield prisma_1.default.admin.count({
        where: whereConditions,
    });
    return {
        meta: {
            page,
            limit,
            total,
        },
        data: result,
    };
});
const getById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.admin.findUnique({
        where: {
            id,
            isDeleted: false,
        },
    });
    return result;
});
const updateAdmin = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma_1.default.admin.findFirstOrThrow({
        where: {
            id,
            isDeleted: false,
        },
    });
    const result = yield prisma_1.default.admin.update({
        where: {
            id,
        },
        data,
    });
    return result;
});
const deleteAdmin = (id) => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma_1.default.admin.findFirstOrThrow({
        where: {
            id,
        },
    });
    const result = yield prisma_1.default.$transaction((transcationClient) => __awaiter(void 0, void 0, void 0, function* () {
        const adminDeletedData = yield transcationClient.admin.delete({
            where: {
                id,
            },
        });
        yield transcationClient.user.delete({
            where: {
                email: adminDeletedData.email,
            },
        });
        return adminDeletedData;
    }));
    return result;
});
const softDelete = (id) => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma_1.default.admin.findFirstOrThrow({
        where: {
            id,
            isDeleted: false,
        },
    });
    const result = yield prisma_1.default.$transaction((transcationClient) => __awaiter(void 0, void 0, void 0, function* () {
        const adminDeletedData = yield transcationClient.admin.update({
            where: {
                id,
            },
            data: {
                isDeleted: true,
            },
        });
        yield transcationClient.user.update({
            where: {
                email: adminDeletedData.email,
            },
            data: {
                status: client_1.UserStatus.DELETED,
            },
        });
        return adminDeletedData;
    }));
    return result;
});
exports.AdminService = {
    getAllAdmin,
    getById,
    updateAdmin,
    deleteAdmin,
    softDelete,
};
/* data = 1 2 3 4 5 6 7 8 9;
page = 2;
limit = 3;
skip = 3;
formula = (page - 1) * limit */
