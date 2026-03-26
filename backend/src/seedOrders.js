const path = require("path");
const dotenv = require("dotenv");
const { connectDB } = require("./config/db");
const { FREE_DELIVERY_THRESHOLD, DELIVERY_CHARGE } = require("./config/commerce");
const Product = require("./models/Product");
const Order = require("./models/Order");
const User = require("./models/User");

dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const SEED_PREFIX = "seed-orders-v1:";
const DEFAULT_PASSWORD = "seed-orders-password";
const ORDER_COUNT = 24;

const seedUsers = [
  {
    name: "Sample Buyer One",
    email: "sample.buyer1@example.com",
    phone: "9001001001",
    address: "23 Anna Salai, Chennai",
    pincode: "600002",
  },
  {
    name: "Sample Buyer Two",
    email: "sample.buyer2@example.com",
    phone: "9001001002",
    address: "15 OMR, Chennai",
    pincode: "600096",
  },
  {
    name: "Sample Buyer Three",
    email: "sample.buyer3@example.com",
    phone: "9001001003",
    address: "9 KK Nagar, Chennai",
    pincode: "600078",
  },
  {
    name: "Sample Buyer Four",
    email: "sample.buyer4@example.com",
    phone: "9001001004",
    address: "44 Velachery Main Road, Chennai",
    pincode: "600042",
  },
];

const statuses = ["placed", "delivered", "cancelled"];
const paymentMethods = ["cod", "upi", "card", "netbanking"];
const paymentStatuses = ["paid", "paid", "paid", "pending", "pending verification", "failed"];

const atRecentDay = (daysAgo, hourOffset) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(9 + hourOffset, (daysAgo * 7) % 60, 0, 0);
  return d;
};

const buildItems = (products, offset) => {
  const first = products[offset % products.length];
  const second = products[(offset + 3) % products.length];
  const third = products[(offset + 7) % products.length];

  return [
    { product: first._id, quantity: (offset % 3) + 1, price: first.price },
    { product: second._id, quantity: ((offset + 1) % 2) + 1, price: second.price },
    { product: third._id, quantity: 1, price: third.price },
  ];
};

const buildOrder = ({ user, products, index }) => {
  const items = buildItems(products, index);
  const subtotal = items.reduce((sum, line) => sum + line.quantity * line.price, 0);
  const deliveryCharge = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE;
  const totalAmount = subtotal + deliveryCharge;
  const createdAt = atRecentDay(index % 7, index % 10);

  const status = statuses[index % statuses.length];
  let paymentStatus = paymentStatuses[index % paymentStatuses.length];

  if (status === "delivered" && paymentStatus !== "paid") {
    paymentStatus = "paid";
  }

  return {
    user: user._id,
    items,
    subtotal,
    deliveryCharge,
    total: totalAmount,
    customerName: user.name,
    phone: user.phone,
    address: user.address,
    pincode: user.pincode,
    status,
    paymentMethod: paymentMethods[index % paymentMethods.length],
    paymentStatus,
    notes: `${SEED_PREFIX}${index + 1}`,
    createdAt,
    updatedAt: createdAt,
  };
};

const ensureSeedUsers = async () => {
  const users = [];

  for (const seedUser of seedUsers) {
    const existing = await User.findOne({ email: seedUser.email });
    if (existing) {
      existing.name = seedUser.name;
      existing.phone = seedUser.phone;
      if (!existing.password) {
        existing.password = DEFAULT_PASSWORD;
      }
      await existing.save();
      users.push(existing);
      continue;
    }

    const created = await User.create({
      name: seedUser.name,
      email: seedUser.email,
      phone: seedUser.phone,
      password: DEFAULT_PASSWORD,
      cart: [],
      orders: [],
    });

    users.push(created);
  }

  return users.map((u) => {
    const meta = seedUsers.find((s) => s.email === u.email);
    return {
      ...u.toObject(),
      _id: u._id,
      address: meta.address,
      pincode: meta.pincode,
    };
  });
};

const clearPreviousSeedOrders = async () => {
  const previous = await Order.find({ notes: { $regex: `^${SEED_PREFIX}` } }).select("_id user");
  if (previous.length === 0) {
    return 0;
  }

  const orderIds = previous.map((order) => order._id);
  const userIds = [...new Set(previous.map((order) => String(order.user)))];

  await Order.deleteMany({ _id: { $in: orderIds } });
  await User.updateMany({ _id: { $in: userIds } }, { $pull: { orders: { $in: orderIds } } });
  return orderIds.length;
};

const seedOrders = async () => {
  console.log("Starting sample order seeding...");

  const products = await Product.find({ isActive: true }).sort({ createdAt: 1 }).limit(30);
  if (products.length < 8) {
    throw new Error("Need at least 8 active products before seeding orders. Run npm run seed first.");
  }

  const users = await ensureSeedUsers();
  const removedCount = await clearPreviousSeedOrders();
  console.log(`Removed previous seeded orders: ${removedCount}`);

  const docs = Array.from({ length: ORDER_COUNT }, (_, index) => {
    const user = users[index % users.length];
    return buildOrder({ user, products, index });
  });

  const insertedOrders = await Order.insertMany(docs, { ordered: true });

  const userOrderMap = new Map();
  insertedOrders.forEach((order) => {
    const key = String(order.user);
    const ids = userOrderMap.get(key) || [];
    ids.push(order._id);
    userOrderMap.set(key, ids);
  });

  await Promise.all(
    Array.from(userOrderMap.entries()).map(([userId, orderIds]) =>
      User.updateOne({ _id: userId }, { $addToSet: { orders: { $each: orderIds } } }),
    ),
  );

  const paidOrders = insertedOrders.filter((order) => order.paymentStatus === "paid");
  const totalRevenue = paidOrders.reduce((sum, order) => sum + order.total, 0);

  const byDay = insertedOrders.reduce((acc, order) => {
    const key = order.createdAt.toISOString().slice(0, 10);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  console.log(`Inserted sample orders: ${insertedOrders.length}`);
  console.log(`Paid orders for dashboard revenue: ${paidOrders.length}`);
  console.log(`Revenue from paid sample orders: ${totalRevenue.toFixed(2)}`);
  console.log("Orders per day (last 7 days window):", byDay);
};

const run = async () => {
  try {
    await connectDB();
    await seedOrders();
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed sample orders", error);
    process.exit(1);
  }
};

if (require.main === module) {
  run();
}

module.exports = { seedOrders };