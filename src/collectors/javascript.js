// throw an error if an collector is found
if (collectorWithPhoneNumber) {
  throw new Error('Phone number already used');
}

// create a new collector
return this.prisma.collector.create({
  data: createCollectorDto,
});
