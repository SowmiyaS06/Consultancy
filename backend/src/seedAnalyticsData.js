const path = require("path");
const dotenv = require("dotenv");
const { connectDB } = require("./config/db");
const { FREE_DELIVERY_THRESHOLD, DELIVERY_CHARGE } = require("./config/commerce");
const Product = require("./models/Product");
const Order = require("./models/Order");
const User = require("./models/User");

dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const SEED_PREFIX = "seed-analytics:";
const DEFAULT_PASSWORD = "seed-password";

const seedUsers = [
  {
    name: "Seed Buyer One",
    email: "seed.buyer1@example.com",
    phone: "9000000001",
    address: "12 Market Street, Chennai",
    pincode: "600001",
  },
  {
    name: "Seed Buyer Two",
    email: "seed.buyer2@example.com",
    phone: "9000000002",
    address: "45 Lake View Road, Chennai",
    pincode: "600002",
  },
];

const daysAgoAt = (daysAgo, hour = 10) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, 0, 0, 0);
  return d;
};

const buildOrderDocument = ({
  user,
  lines,
  paymentMethod,
  paymentStatus,
  status,
  createdAt,
  tag,
}) => {
  const items = lines.map((line) => ({
    product: line.product._id,
    quantity: line.quantity,
    price: line.product.price,
  }));

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryCharge = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE;
  const total = subtotal + deliveryCharge;

  return {
    user: user._id,
    items,
    subtotal,
    deliveryCharge,
    total,
    customerName: user.name,
    phone: user.phone,
    address: user.address,
    pincode: user.pincode,
    notes: `${SEED_PREFIX}${tag}`,
    paymentMethod,
    paymentStatus,
    status,
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
    return;
  }

  const orderIds = previous.map((o) => o._id);
  const userIds = [...new Set(previous.map((o) => String(o.user)))];

  await Order.deleteMany({ _id: { $in: orderIds } });
  await User.updateMany(
    { _id: { $in: userIds } },
    { $pull: { orders: { $in: orderIds } } },
  );
};

const seedAnalyticsData = async () => {
  const products = await Product.find({ isActive: true }).sort({ createdAt: 1 }).limit(5);
  if (products.length < 3) {
    throw new Error("Need at least 3 active products. Run: npm run seed:products");
  }

  const [productA, productB, productC, productD = products[0], productE = products[1]] = products;
  const [buyerOne, buyerTwo] = await ensureSeedUsers();

  await clearPreviousSeedOrders();

  const ordersToInsert = [
    buildOrderDocument({
      user: buyerOne,
      lines: [
        { product: productA, quantity: 2 },
        { product: productB, quantity: 1 },
      ],
      paymentMethod: "upi",
      paymentStatus: "paid",
      status: "placed",
      createdAt: daysAgoAt(0, 11),
      tag: "today-paid-upi",
    }),
    buildOrderDocument({
      user: buyerTwo,
      lines: [
        { product: productA, quantity: 1 },
        { product: productC, quantity: 3 },
      ],
      paymentMethod: "card",
      paymentStatus: "paid",
      status: "delivered",
      createdAt: daysAgoAt(1, 12),
      tag: "yesterday-paid-card",
    }),
    buildOrderDocument({
      user: buyerOne,
      lines: [
        { product: productB, quantity: 4 },
        { product: productD, quantity: 1 },
      ],
      paymentMethod: "netbanking",
      paymentStatus: "paid",
      status: "delivered",
      createdAt: daysAgoAt(2, 13),
      tag: "two-days-paid-netbanking",
    }),
    buildOrderDocument({
      user: buyerTwo,
      lines: [
        { product: productC, quantity: 2 },
        { product: productE, quantity: 2 },
      ],
      paymentMethod: "cod",
      paymentStatus: "paid",
      status: "delivered",
      createdAt: daysAgoAt(4, 14),
      tag: "four-days-paid-cod",
    }),
    buildOrderDocument({
      user: buyerOne,
      lines: [{ product: productA, quantity: 1 }],
      paymentMethod: "upi",
      paymentStatus: "paid",
      status: "delivered",
      createdAt: daysAgoAt(6, 15),
      tag: "six-days-paid-upi",
    }),
    buildOrderDocument({
      user: buyerTwo,
      lines: [{ product: productB, quantity: 1 }],
      paymentMethod: "upi",
      paymentStatus: "pending verification",
      status: "placed",
      createdAt: daysAgoAt(0, 16),
      tag: "today-pending-verification",
    }),
    buildOrderDocument({
      user: buyerOne,
      lines: [{ product: productC, quantity: 1 }],
      paymentMethod: "card",
      paymentStatus: "pending",
      status: "placed",
      createdAt: daysAgoAt(3, 10),
      tag: "three-days-pending",
    }),
    buildOrderDocument({
      user: buyerTwo,
      lines: [{ product: productA, quantity: 5 }],
      paymentMethod: "upi",
      paymentStatus: "paid",
      status: "delivered",
      createdAt: daysAgoAt(40, 10),
      tag: "older-paid-order",
    }),
  ];

  const insertedOrders = await Order.insertMany(ordersToInsert);

  const userOrderMap = new Map();
  insertedOrders.forEach((order) => {
    const key = String(order.user);
    const list = userOrderMap.get(key) || [];
    list.push(order._id);
    userOrderMap.set(key, list);
  });

  const updates = Array.from(userOrderMap.entries()).map(([userId, orderIds]) =>
    User.updateOne({ _id: userId }, { $addToSet: { orders: { $each: orderIds } } }),
  );

  await Promise.all(updates);

  const paidOrders = insertedOrders.filter((order) => order.paymentStatus === "paid");
  const paidRevenue = paidOrders.reduce((sum, order) => sum + order.total, 0);

  console.log(`Inserted sample orders: ${insertedOrders.length}`);
  console.log(`Paid orders for analytics: ${paidOrders.length}`);
  console.log(`Paid revenue in sample data: ${paidRevenue.toFixed(2)}`);
};

const run = async () => {
  try {
    await connectDB();
    await seedAnalyticsData();
    process.exit(0);
  } catch (err) {
    console.error("Failed to seed analytics sample data", err);
    process.exit(1);
  }
};

if (require.main === module) {
  run();
}

module.exports = { seedAnalyticsData };
